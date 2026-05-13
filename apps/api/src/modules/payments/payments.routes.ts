import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  createRazorpayOrder,
  listAdminPayments,
  listMyPayments,
  verifyRazorpayPayment
} from "./payments.service.js";

export const paymentsRoutes = Router();

const createOrderSchema = z.object({
  bookingId: z.string().min(1)
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

paymentsRoutes.post("/create-order", authMiddleware, async (req, res) => {
  const input = createOrderSchema.parse(req.body);
  const order = await createRazorpayOrder(res.locals.firebaseUser.uid, input.bookingId);
  res.json({ order });
});

paymentsRoutes.post("/verify", authMiddleware, async (req, res) => {
  const result = await verifyRazorpayPayment(res.locals.firebaseUser.uid, verifySchema.parse(req.body));
  res.json(result);
});

paymentsRoutes.get("/me", authMiddleware, async (_req, res) => {
  const payments = await listMyPayments(res.locals.firebaseUser.uid);
  res.json({ payments });
});

paymentsRoutes.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  const result = await listAdminPayments(req.query);
  res.json(result);
});
