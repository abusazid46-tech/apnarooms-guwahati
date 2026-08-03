import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

function cleanPublicEnv(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

const firebaseDefaults = {
  apiKey: "AIzaSyDPnWksHuwKsSHQoLwR7I_fHLwgtCswFH4",
  authDomain: "apnarooms-guwahati.firebaseapp.com",
  projectId: "apnarooms-guwahati",
  storageBucket: "apnarooms-guwahati.firebasestorage.app",
  appId: "1:794053444845:web:8c254ca78b5d975c6878e4"
};

const firebaseProjectId = cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ?? firebaseDefaults.projectId;

const firebaseConfig = {
  apiKey: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) ?? firebaseDefaults.apiKey,
  authDomain: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ?? firebaseDefaults.authDomain ?? (firebaseProjectId ? `${firebaseProjectId}.firebaseapp.com` : undefined),
  projectId: firebaseProjectId,
  storageBucket: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ?? firebaseDefaults.storageBucket,
  appId: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) ?? firebaseDefaults.appId
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
