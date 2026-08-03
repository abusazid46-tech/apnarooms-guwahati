import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

function cleanPublicEnv(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

const firebaseProjectId = cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ?? (firebaseProjectId ? `${firebaseProjectId}.firebaseapp.com` : undefined),
  projectId: firebaseProjectId,
  storageBucket: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  appId: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedStorage: FirebaseStorage | null = null;

function assertBrowserFirebaseConfig() {
  if (!firebaseConfig.apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!firebaseConfig.projectId) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
}

export function getFirebaseApp() {
  assertBrowserFirebaseConfig();
  cachedApp = cachedApp ?? (getApps().length ? getApps()[0] : initializeApp(firebaseConfig));
  return cachedApp;
}

export async function getFirebaseAuth() {
  const { getAuth } = await import("firebase/auth");
  cachedAuth = cachedAuth ?? getAuth(getFirebaseApp());
  return cachedAuth;
}

export async function getFirebaseStorage() {
  const { getStorage } = await import("firebase/storage");
  cachedStorage = cachedStorage ?? getStorage(getFirebaseApp());
  return cachedStorage;
}
