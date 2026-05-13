import { Router } from "express";
import { processRazorpayWebhook } from "./payments.service.js";

export const webhookRoutes = Router();

webhookRoutes.post("/", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const result = await processRazorpayWebhook(
    Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body)),
    Array.isArray(signature) ? signature[0] : signature
  );

  res.json({ received: true, ...result });
});
