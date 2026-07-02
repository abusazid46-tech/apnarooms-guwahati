import type { NextFunction, Request, Response } from "express";
import { prisma } from "@apnarooms/db";
import { isConfiguredAdminUser, syncUser } from "../modules/auth/auth.service.js";

export async function adminMiddleware(_req: Request, res: Response, next: NextFunction) {
  const firebaseUser = res.locals.firebaseUser;
  const firebaseUid = firebaseUser?.uid;

  if (!firebaseUid) {
    res.status(401).json({ message: "Missing authenticated user" });
    return;
  }

  let user = await prisma.user.findUnique({ where: { firebaseUid } });

  if ((!user || user.role === "USER" || user.role === "LANDLORD") && isConfiguredAdminUser(firebaseUser)) {
    user = await syncUser(firebaseUser);
  }

  if (!user || !["ADMIN", "SALES", "SUPPORT"].includes(user.role)) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  res.locals.currentUser = user;
  next();
}
