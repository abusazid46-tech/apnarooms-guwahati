import type { NextFunction, Request, Response } from "express";
import { getFirebaseAdmin } from "../config/firebase-admin.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Missing auth token" });
      return;
    }

    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    res.locals.firebaseUser = decodedToken;
    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Firebase Admin environment variables")) {
      res.status(503).json({ message: "Firebase Admin is not configured" });
      return;
    }

    res.status(401).json({ message: "Invalid auth token" });
  }
}
