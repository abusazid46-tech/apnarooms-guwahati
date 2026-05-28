import { prisma } from "@apnarooms/db";
import { applyCouponToAmount } from "../coupons/coupons.service.js";
import { ApiError } from "../../utils/api-error.js";

type CreateBookingInput = {
  propertyId: string;
  couponCode?: string;
  moveInDate?: Date;
};

type UpdateBookingInput = {
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  moveInDate?: Date;
};

const bookingInclude = {
  tenant: { select: { id: true, name: true, phone: true, email: true } },
  property: { include: { images: { orderBy: { sortOrder: "asc" as const } } } },
  payment: true
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

export async function createBooking(firebaseUid: string, input: CreateBookingInput) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const property = await prisma.property.findUniqueOrThrow({ where: { id: input.propertyId } });

  if (property.status !== "PUBLISHED" || !property.isAvailable) {
    throw new ApiError(400, "Property is not available for booking");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      tenantId: user.id,
      propertyId: property.id,
      status: { in: ["PENDING_PAYMENT", "CONFIRMED"] }
    },
    include: bookingInclude,
    orderBy: { createdAt: "desc" }
  });

  if (existingBooking?.status === "CONFIRMED") {
    throw new ApiError(409, "You already have a confirmed booking for this property");
  }

  if (existingBooking) {
    return existingBooking;
  }

  const previousBookingCount = await prisma.booking.count({ where: { tenantId: user.id } });
  const couponResult = input.couponCode
    ? await applyCouponToAmount(input.couponCode, property.tokenAmount)
    : { finalAmount: property.tokenAmount };

  return prisma.$transaction(async (tx: any) => {
    const booking = await tx.booking.create({
      data: {
        tenantId: user.id,
        propertyId: property.id,
        tokenAmount: couponResult.finalAmount,
        moveInDate: input.moveInDate,
        status: "PENDING_PAYMENT"
      },
      include: bookingInclude
    });

    if (previousBookingCount === 0) {
      await tx.lead.create({
        data: {
          name: user.name ?? "First-time booker",
          phone: user.phone,
          email: user.email,
          source: "first_booking",
          propertyId: property.id,
          message: [
            "First-time service booker created a booking request.",
            `Booking ID: ${booking.id}`,
            `Property: ${property.title}`,
            `Token amount: INR ${booking.tokenAmount}`
          ].join("\n")
        }
      });
    }

    return booking;
  });
}

export async function listMyBookings(firebaseUid: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });

  return prisma.booking.findMany({
    where: { tenantId: user.id },
    include: bookingInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function getBooking(firebaseUid: string, bookingId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingInclude
  });

  if (!booking || booking.tenantId !== user.id) throw new ApiError(404, "Booking not found");
  return booking;
}

export async function listAdminBookings(query: Record<string, unknown>) {
  const { page, limit, skip } = pagination(query);
  const status = asString(query.status);
  const propertyId = asString(query.propertyId);
  const tenantId = asString(query.tenantId);

  const where: any = {
    ...(status ? { status } : {}),
    ...(propertyId ? { propertyId } : {}),
    ...(tenantId ? { tenantId } : {})
  };

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.booking.count({ where })
  ]);

  return { bookings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function updateBookingStatus(id: string, input: UpdateBookingInput) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError(404, "Booking not found");

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.booking.update({
      where: { id },
      data: {
        status: input.status,
        moveInDate: input.moveInDate
      },
      include: bookingInclude
    });

    if (input.status === "CONFIRMED") {
      await tx.property.update({
        where: { id: booking.propertyId },
        data: { isAvailable: false }
      });
    }

    if (input.status === "CANCELLED" || input.status === "REFUNDED") {
      const confirmedCount = await tx.booking.count({
        where: {
          propertyId: booking.propertyId,
          status: "CONFIRMED",
          id: { not: booking.id }
        }
      });

      if (confirmedCount === 0) {
        await tx.property.update({
          where: { id: booking.propertyId },
          data: { isAvailable: true }
        });
      }
    }

    return updated;
  });
}
