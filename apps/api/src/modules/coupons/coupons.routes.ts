import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  applyCouponToAmount,
  createCoupon,
  deleteCoupon,
  listAdminCoupons,
  listPublicCoupons,
  updateCoupon
} from "./coupons.service.js";

export const couponsRoutes = Router();

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().int().positive().nullable().optional()
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.date().nullable().optional()
);

const couponBaseSchema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().int().positive(),
  maxDiscount: optionalPositiveInt,
  isActive: z.boolean().optional(),
  expiresAt: optionalDate
});

function validatePercentOffer(input: { type?: "PERCENT" | "FLAT"; value?: number }, ctx: z.RefinementCtx) {
  if (input.type === "PERCENT" && typeof input.value === "number" && input.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Percentage offers cannot be above 100"
    });
  }
}

const couponSchema = couponBaseSchema.superRefine(validatePercentOffer);
const couponUpdateSchema = couponBaseSchema.partial().superRefine((input, ctx) => {
  if (input.type === "PERCENT") {
    validatePercentOffer(input, ctx);
  }
  if (!input.type && typeof input.value === "number" && input.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Set the offer type when changing a percentage value above 100"
      });
    }
});

const validateSchema = z.object({
  code: z.string().min(1),
  amount: z.coerce.number().int().nonnegative()
});

couponsRoutes.get("/", async (_req, res) => {
  const coupons = await listPublicCoupons();
  res.json({ coupons });
});

couponsRoutes.post("/validate", async (req, res) => {
  const input = validateSchema.parse(req.body);
  const result = await applyCouponToAmount(input.code, input.amount);
  res.json(result);
});

couponsRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  const coupons = await listAdminCoupons();
  res.json({ coupons });
});

couponsRoutes.post("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const coupon = await createCoupon(couponSchema.parse(req.body));
  res.status(201).json({ coupon });
});

couponsRoutes.patch("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const coupon = await updateCoupon(String(req.params.id), couponUpdateSchema.parse(req.body));
  res.json({ coupon });
});

couponsRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const coupon = await deleteCoupon(String(req.params.id));
  res.json({ coupon });
});
