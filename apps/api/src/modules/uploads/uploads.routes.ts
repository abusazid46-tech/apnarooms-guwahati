import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

export const uploadsRoutes = Router();

uploadsRoutes.post("/property-image", authMiddleware, adminMiddleware, async (_req, res) => {
  res.json({ message: "Upload image to Firebase Storage from the web app, then save URL here." });
});
