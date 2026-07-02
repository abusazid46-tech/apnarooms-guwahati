function stripWrappingQuotes(value: string) {
  return value.replace(/^['"]|['"]$/g, "");
}

function decodeBase64(value?: string) {
  if (!value?.trim()) return "";

  try {
    return Buffer.from(value.trim(), "base64").toString("utf8");
  } catch {
    return "";
  }
}

function cleanPrivateKey(value?: string) {
  const rawValue = value?.trim() || decodeBase64(process.env.FIREBASE_PRIVATE_KEY_BASE64);
  if (!rawValue) return "";

  let key = stripWrappingQuotes(rawValue.trim());

  for (let index = 0; index < 3 && key.includes("\\n"); index += 1) {
    key = key.replace(/\\n/g, "\n");
  }

  return key.replace(/\r\n/g, "\n").trim();
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

export function firebaseEnvDiagnostics() {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? "";
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64 ?? "";
  const cleanKey = env.FIREBASE_PRIVATE_KEY;

  return {
    projectIdPresent: Boolean(env.FIREBASE_PROJECT_ID),
    clientEmailPresent: Boolean(env.FIREBASE_CLIENT_EMAIL),
    clientEmailMatchesProject: Boolean(
      env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL.includes(env.FIREBASE_PROJECT_ID)
    ),
    rawPrivateKeyPresent: Boolean(rawKey),
    rawPrivateKeyLength: rawKey.length,
    base64PrivateKeyPresent: Boolean(base64Key),
    cleanPrivateKeyPresent: Boolean(cleanKey),
    cleanPrivateKeyLength: cleanKey.length,
    cleanPrivateKeyLineCount: cleanKey ? cleanKey.split("\n").length : 0,
    cleanPrivateKeyStartsCorrectly: cleanKey.startsWith("-----BEGIN PRIVATE KEY-----"),
    cleanPrivateKeyEndsCorrectly: cleanKey.endsWith("-----END PRIVATE KEY-----"),
    cleanPrivateKeyStillHasLiteralSlashN: cleanKey.includes("\\n")
  };
}
