import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { syncUser } from "./auth.service.js";

export const authRoutes = Router();

authRoutes.post("/sync-user", authMiddleware, async (_req, res) => {
  const user = await syncUser(res.locals.firebaseUser);
  res.json({ user });
});
