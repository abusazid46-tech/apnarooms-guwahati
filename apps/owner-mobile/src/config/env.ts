import Constants from "expo-constants";

declare const process: {
  env: Record<string, string | undefined>;
};

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra?.apiBaseUrl ?? "https://darkred-coyote-647666.hostingersite.com/api",
  webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? "https://www.apnarooms.com",
  whatsappNumber: "918133983732",
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  }
};
