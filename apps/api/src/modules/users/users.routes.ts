import { Router } from "express";
import { prisma } from "@apnarooms/db";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

export const usersRoutes = Router();

usersRoutes.get("/me", authMiddleware, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { firebaseUid: res.locals.firebaseUser.uid }
  });
  res.json({ user });
});

usersRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ users });
});
