import type { NextFunction, Request, Response } from "express";
import { prisma } from "@apnarooms/db";

export async function adminMiddleware(_req: Request, res: Response, next: NextFunction) {
  const firebaseUid = res.locals.firebaseUser?.uid;

  if (!firebaseUid) {
    res.status(401).json({ message: "Missing authenticated user" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user || !["ADMIN", "SALES", "SUPPORT"].includes(user.role)) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  res.locals.currentUser = user;
  next();
}
