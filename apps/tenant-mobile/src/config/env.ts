import Constants from "expo-constants";

declare const process: {
  env: Record<string, string | undefined>;
};

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? extra?.apiBaseUrl ?? "https://apnarooms-guwahati-3lm4.onrender.com/api",
  webUrl: process.env.EXPO_PUBLIC_WEB_URL ?? "https://www.apnarooms.com",
  whatsappNumber: "918133983732"
};
