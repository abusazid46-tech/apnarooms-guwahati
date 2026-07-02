import admin from "firebase-admin";
import { env, firebaseEnvDiagnostics } from "./env.js";

export function getFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    throw new Error("Firebase Admin environment variables are not configured.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    })
  });
}

export function getFirebaseAdminDiagnostics() {
  const config = firebaseEnvDiagnostics();

  try {
    getFirebaseAdmin();
    return { ok: true, config };
  } catch (error) {
    const firebaseError = error as Error & { code?: string };
    return {
      ok: false,
      config,
      errorCode: firebaseError.code ?? null,
      errorMessage: firebaseError.message
    };
  }
}
