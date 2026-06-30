import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { env } from "@/config/env";

function assertFirebaseConfig() {
  if (!env.firebase.apiKey || !env.firebase.projectId || !env.firebase.appId) {
    throw new Error("Add Firebase public config to apps/owner-mobile/.env before login.");
  }
}

export function getFirebaseApp() {
  assertFirebaseConfig();
  return getApps().length ? getApps()[0] : initializeApp(env.firebase);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    return getAuth(app);
  }
}
