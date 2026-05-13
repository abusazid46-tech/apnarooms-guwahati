import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type CouponInput = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  maxDiscount?: number;
  isActive?: boolean;
  expiresAt?: Date;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function listPublicCoupons() {
  return prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    select: {
      code: true,
      type: true,
      value: true,
      maxDiscount: true,
      expiresAt: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function listAdminCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function applyCouponToAmount(code: string, amount: number) {
  const normalizedCode = normalizeCode(code);
  const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

  if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt <= new Date())) {
    throw new ApiError(400, "Invalid or expired coupon");
  }

  const discount =
    coupon.type === "FLAT"
      ? coupon.value
      : Math.floor((amount * coupon.value) / 100);
  const cappedDiscount = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  const finalAmount = Math.max(0, amount - cappedDiscount);

  return {
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount
    },
    originalAmount: amount,
    discountAmount: amount - finalAmount,
    finalAmount
  };
}

export async function createCoupon(input: CouponInput) {
  return prisma.coupon.create({
    data: {
      code: normalizeCode(input.code),
      type: input.type,
      value: input.value,
      maxDiscount: input.maxDiscount,
      isActive: input.isActive ?? true,
      expiresAt: input.expiresAt
    }
  });
}

export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  return prisma.coupon.update({
    where: { id },
    data: {
      code: input.code ? normalizeCode(input.code) : undefined,
      type: input.type,
      value: input.value,
      maxDiscount: input.maxDiscount,
      isActive: input.isActive,
      expiresAt: input.expiresAt
    }
  });
}

export async function deleteCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  return prisma.coupon.update({
    where: { id },
    data: { isActive: false }
  });
}
