import { prisma } from "@apnarooms/db";
import { env } from "../../config/env.js";

type FirebaseUser = {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
};

export async function syncUser(firebaseUser: FirebaseUser) {
  const existingUserCount = await prisma.user.count();
  const normalizedEmail = firebaseUser.email?.toLowerCase() ?? null;
  const normalizedPhone = firebaseUser.phone_number ?? null;
  const isConfiguredAdmin = Boolean(normalizedEmail && env.ADMIN_EMAILS.includes(normalizedEmail));
  const userData = {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
    phone: normalizedPhone,
    name: firebaseUser.name ?? null,
    avatarUrl: firebaseUser.picture ?? null,
    ...(isConfiguredAdmin ? { role: "ADMIN" as const } : {})
  };

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid: firebaseUser.uid },
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
      ]
    }
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: userData
    });
  }

  return prisma.user.create({
    data: {
      ...userData,
      role: isConfiguredAdmin || existingUserCount === 0 ? "ADMIN" : "USER"
    }
  });
}
