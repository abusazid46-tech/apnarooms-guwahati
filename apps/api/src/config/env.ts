function cleanPrivateKey(value?: string) {
  return value
    ?.trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\n/g, "\n") ?? "";
}

export const env = {
  API_PORT: Number(process.env.PORT ?? process.env.API_PORT ?? 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID?.trim() ?? "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? "",
  FIREBASE_PRIVATE_KEY: cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  ADMIN_EMAILS: process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? []
};
