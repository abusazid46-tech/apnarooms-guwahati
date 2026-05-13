import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
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

export function getFirebaseAuth() {
  cachedAuth = cachedAuth ?? getAuth(getFirebaseApp());
  return cachedAuth;
}

export function getFirebaseStorage() {
  cachedStorage = cachedStorage ?? getStorage(getFirebaseApp());
  return cachedStorage;
}
