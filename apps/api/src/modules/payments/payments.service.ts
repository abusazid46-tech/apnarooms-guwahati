import crypto from "node:crypto";
import { prisma } from "@apnarooms/db";
import { env } from "../../config/env.js";
import { razorpay } from "../../config/razorpay.js";

export async function createRazorpayOrder(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });

  const order = await razorpay.orders.create({
    amount: booking.tokenAmount * 100,
    currency: "INR",
    receipt: booking.id
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "RAZORPAY",
      providerOrderId: order.id,
      amount: booking.tokenAmount,
      currency: "INR",
      status: "ORDER_CREATED"
    }
  });

  return order;
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== input.razorpay_signature) {
    return { verified: false };
  }

  await prisma.payment.updateMany({
    where: { providerOrderId: input.razorpay_order_id },
    data: {
      providerPaymentId: input.razorpay_payment_id,
      status: "PAID"
    }
  });

  return { verified: true };
}
