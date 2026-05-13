import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

export const leadsRoutes = Router();

leadsRoutes.post("/", async (_req, res) => {
  res.status(201).json({ lead: null });
});

leadsRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  res.json({ leads: [] });
});
