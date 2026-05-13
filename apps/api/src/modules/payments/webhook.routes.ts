import { Router } from "express";

export const webhookRoutes = Router();

webhookRoutes.post("/", async (_req, res) => {
  // Verify Razorpay webhook signature before trusting payload.
  res.json({ received: true });
});
