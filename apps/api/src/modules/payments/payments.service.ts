import crypto from "node:crypto";
import { prisma } from "@apnarooms/db";
import { env } from "../../config/env.js";
import { getRazorpay } from "../../config/razorpay.js";
import { ApiError } from "../../utils/api-error.js";

type VerifyInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const paymentInclude = {
  booking: {
    include: {
      tenant: { select: { id: true, name: true, phone: true, email: true } },
      property: { include: { images: { orderBy: { sortOrder: "asc" as const } } } }
    }
  }
};

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function pagination(query: Record<string, unknown>) {
  const page = Math.max(1, asNumber(query.page) ?? 1);
  const limit = Math.min(100, Math.max(1, asNumber(query.limit) ?? 20));
  return { page, limit, skip: (page - 1) * limit };
}

function paymentSignature(orderId: string, paymentId: string) {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, "Razorpay server configuration is missing");
  }

  return crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
}

export async function createRazorpayOrder(firebaseUid: string, bookingId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, property: true }
  });

  if (!booking || booking.tenantId !== user.id) throw new ApiError(404, "Booking not found");
  if (booking.status !== "PENDING_PAYMENT") throw new ApiError(400, "Booking is not payable");

  if (booking.payment) {
    return {
      id: booking.payment.providerOrderId,
      amount: booking.payment.amount * 100,
      currency: booking.payment.currency,
      receipt: booking.id,
      keyId: env.RAZORPAY_KEY_ID
    };
  }

  const razorpay = getRazorpay();

  if (!razorpay) {
    throw new ApiError(503, "Razorpay server configuration is missing");
  }

  const order = await razorpay.orders.create({
    amount: booking.tokenAmount * 100,
    currency: "INR",
    receipt: booking.id,
    notes: {
      bookingId: booking.id,
      propertyId: booking.propertyId
    }
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "RAZORPAY",
      providerOrderId: order.id,
      amount: booking.tokenAmount,
      currency: "INR",
      status: "ORDER_CREATED",
      rawPayload: order as any
    }
  });

  return { ...order, keyId: env.RAZORPAY_KEY_ID };
}

export async function verifyRazorpayPayment(firebaseUid: string, input: VerifyInput) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const expected = paymentSignature(input.razorpay_order_id, input.razorpay_payment_id);

  if (expected !== input.razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: input.razorpay_order_id },
    include: { booking: true }
  });

  if (!payment || payment.booking.tenantId !== user.id) throw new ApiError(404, "Payment not found");

  const updated = await prisma.$transaction(async (tx: any) => {
    const nextPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: input.razorpay_payment_id,
        status: "PAID"
      },
      include: paymentInclude
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" }
    });

    await tx.property.update({
      where: { id: payment.booking.propertyId },
      data: { isAvailable: false }
    });

    return nextPayment;
  });

  return { verified: true, payment: updated };
}

export async function listMyPayments(firebaseUid: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });

  return prisma.payment.findMany({
    where: { booking: { tenantId: user.id } },
    include: paymentInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function listAdminPayments(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const status = asString(query.status);

  const where: any = {
    ...(status ? { status } : {})
  };

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.payment.count({ where })
  ]);

  return { payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function processRazorpayWebhook(rawBody: Buffer, signatureHeader: string | undefined) {
  if (env.RAZORPAY_WEBHOOK_SECRET) {
    if (!signatureHeader) throw new ApiError(400, "Missing webhook signature");

    const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
    if (expected !== signatureHeader) throw new ApiError(400, "Invalid webhook signature");
  }

  const event = JSON.parse(rawBody.toString("utf8"));
  const paymentEntity = event?.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id;

  if (!orderId) return { processed: false, reason: "No order id in webhook" };

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: orderId },
      include: { booking: true }
    });
    if (!payment) return { processed: false, reason: "Payment record not found" };

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: paymentId ?? payment.providerPaymentId,
          status: "PAID",
          rawPayload: event as any
        }
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" }
      }),
      prisma.property.update({
        where: { id: payment.booking.propertyId },
        data: { isAvailable: false }
      })
    ]);

    return { processed: true };
  }

  if (event.event === "payment.failed") {
    await prisma.payment.updateMany({
      where: { providerOrderId: orderId },
      data: { status: "FAILED", rawPayload: event as any }
    });
    return { processed: true };
  }

  return { processed: false, reason: "Ignored event" };
}
