import type { NextFunction, Request, Response } from "express";
import { getFirebaseAdmin } from "../config/firebase-admin.js";

type FirebaseAuthError = Error & { code?: string };

function authErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Invalid auth token";

  const firebaseError = error as FirebaseAuthError;
  const detail = firebaseError.code ?? error.message;

  if (
    error.message.includes("Firebase Admin environment variables") ||
    error.message.includes("private key") ||
    error.message.includes("PEM") ||
    error.message.includes("credential")
  ) {
    return `Firebase Admin configuration error: ${detail}`;
  }

  if (firebaseError.code === "auth/id-token-expired") {
    return "Firebase login expired. Please logout and login again.";
  }

  if (firebaseError.code === "auth/argument-error" || firebaseError.code === "auth/invalid-credential") {
    return `Firebase token verification failed: ${detail}`;
  }

  return `Invalid auth token: ${detail}`;
}

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
    const message = authErrorMessage(error);
    res.status(message.startsWith("Firebase Admin configuration error") ? 503 : 401).json({ message });
  }
}
