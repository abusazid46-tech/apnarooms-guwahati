import type { NextFunction, Request, Response } from "express";
import { firebaseAdmin } from "../config/firebase-admin.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Missing auth token" });
      return;
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    res.locals.firebaseUser = decodedToken;
    next();
  } catch {
    res.status(401).json({ message: "Invalid auth token" });
  }
}
