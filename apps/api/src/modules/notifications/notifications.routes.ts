import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import {
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "./notifications.service.js";

export const notificationsRoutes = Router();

notificationsRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  const result = await listAdminNotifications();
  res.json(result);
});

notificationsRoutes.patch("/admin/:id/read", authMiddleware, adminMiddleware, async (req, res) => {
  const notification = await markNotificationRead(String(req.params.id));
  res.json({ notification });
});

notificationsRoutes.patch("/admin/read-all", authMiddleware, adminMiddleware, async (_req, res) => {
  await markAllNotificationsRead();
  res.json({ ok: true });
});
