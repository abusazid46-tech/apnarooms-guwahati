import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookingsRoutes } from "./modules/bookings/bookings.routes.js";
import { couponsRoutes } from "./modules/coupons/coupons.routes.js";
import { leadsRoutes } from "./modules/leads/leads.routes.js";
import { paymentsRoutes } from "./modules/payments/payments.routes.js";
import { webhookRoutes } from "./modules/payments/webhook.routes.js";
import { propertiesRoutes } from "./modules/properties/properties.routes.js";
import { uploadsRoutes } from "./modules/uploads/uploads.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://apnarooms-guwahati-web.vercel.app"
];

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins,
    ...env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  ])
);

function corsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
  if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS origin is not allowed: ${origin}`));
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));

  app.use("/api/payments/webhook", express.raw({ type: "application/json" }), webhookRoutes);
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/properties", propertiesRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/leads", leadsRoutes);
  app.use("/api/coupons", couponsRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use(errorMiddleware);

  return app;
}
