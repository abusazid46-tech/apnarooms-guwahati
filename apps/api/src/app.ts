import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { bookingsRoutes } from "./modules/bookings/bookings.routes.js";
import { blogRoutes } from "./modules/blog/blog.routes.js";
import { couponsRoutes } from "./modules/coupons/coupons.routes.js";
import { leadsRoutes } from "./modules/leads/leads.routes.js";
import { paymentsRoutes } from "./modules/payments/payments.routes.js";
import { webhookRoutes } from "./modules/payments/webhook.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { propertiesRoutes } from "./modules/properties/properties.routes.js";
import { reviewsRoutes } from "./modules/reviews/reviews.routes.js";
import { uploadsRoutes } from "./modules/uploads/uploads.routes.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://apnarooms-guwahati-web.vercel.app",
  "https://www.apnarooms.com",
  "https://apnarooms.com"
];

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins,
    ...env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  ])
);

const fallbackApiBaseUrl =
  process.env.FALLBACK_API_BASE_URL?.trim() ||
  process.env.PUBLIC_PROPERTIES_FALLBACK_BASE_URL?.trim() ||
  "https://darkred-coyote-647666.hostingersite.com";

function corsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
  if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS origin is not allowed: ${origin}`));
}

async function proxyFallbackApi(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const upstreamUrl = new URL(req.originalUrl, fallbackApiBaseUrl);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || ["host", "content-length", "connection"].includes(key.toLowerCase())) continue;
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const requestBody = hasBody && req.body ? JSON.stringify(req.body) : undefined;
    if (requestBody && !headers.has("content-type")) headers.set("content-type", "application/json");

    const upstreamResponse = await fetch(upstreamUrl, { method: req.method, headers, body: requestBody });
    const responseBody = await upstreamResponse.text();

    upstreamResponse.headers.forEach((value, key) => {
      if (["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    res.status(upstreamResponse.status).send(responseBody);
  } catch (error) {
    next(error);
  }
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
  app.use("/api/properties", proxyFallbackApi);
  app.use("/api/properties", propertiesRoutes);
  app.use("/api/reviews", proxyFallbackApi);
  app.use("/api/blog", blogRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/leads", leadsRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/coupons", couponsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use(errorMiddleware);

  return app;
}
