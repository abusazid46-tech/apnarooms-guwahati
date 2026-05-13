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

const couponSchema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().int().positive(),
  maxDiscount: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.coerce.date().optional()
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
  const coupon = await updateCoupon(String(req.params.id), couponSchema.partial().parse(req.body));
  res.json({ coupon });
});

couponsRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const coupon = await deleteCoupon(String(req.params.id));
  res.json({ coupon });
});
