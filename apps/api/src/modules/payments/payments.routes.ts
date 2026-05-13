import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "./payments.service.js";

export const paymentsRoutes = Router();

paymentsRoutes.post("/create-order", authMiddleware, async (req, res) => {
  const order = await createRazorpayOrder(req.body.bookingId);
  res.json({ order });
});

paymentsRoutes.post("/verify", authMiddleware, async (req, res) => {
  const result = await verifyRazorpayPayment(req.body);
  res.json(result);
});
