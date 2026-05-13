import { prisma } from "@apnarooms/db";

export async function createBooking(firebaseUid: string, propertyId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });
  const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });

  return prisma.booking.create({
    data: {
      tenantId: user.id,
      propertyId: property.id,
      tokenAmount: property.tokenAmount,
      status: "PENDING_PAYMENT"
    }
  });
}

export async function listMyBookings(firebaseUid: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { firebaseUid } });

  return prisma.booking.findMany({
    where: { tenantId: user.id },
    include: { property: { include: { images: true } }, payment: true },
    orderBy: { createdAt: "desc" }
  });
}
