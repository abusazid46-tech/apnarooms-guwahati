import { Router } from "express";
import { z } from "zod";
import { prisma } from "@apnarooms/db";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";
import { ApiError } from "../../utils/api-error.js";

export const usersRoutes = Router();

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional()
});

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SALES", "SUPPORT", "LANDLORD"])
});

usersRoutes.get("/me", authMiddleware, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { firebaseUid: res.locals.firebaseUser.uid }
  });
  res.json({ user });
});

usersRoutes.patch("/me", authMiddleware, async (req, res) => {
  const input = profileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { firebaseUid: res.locals.firebaseUser.uid },
    data: input
  });
  res.json({ user });
});

usersRoutes.get("/admin", authMiddleware, adminMiddleware, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ users });
});

usersRoutes.patch("/admin/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  const input = roleSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "User not found");

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: input.role }
  });

  res.json({ user });
});
