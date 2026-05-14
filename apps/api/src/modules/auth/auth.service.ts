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
  const isConfiguredAdmin = Boolean(normalizedEmail && env.ADMIN_EMAILS.includes(normalizedEmail));

  return prisma.user.upsert({
    where: { firebaseUid: firebaseUser.uid },
    update: {
      email: firebaseUser.email ?? null,
      phone: firebaseUser.phone_number ?? null,
      name: firebaseUser.name ?? null,
      avatarUrl: firebaseUser.picture ?? null,
      role: isConfiguredAdmin ? "ADMIN" : undefined
    },
    create: {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email ?? null,
      phone: firebaseUser.phone_number ?? null,
      name: firebaseUser.name ?? null,
      avatarUrl: firebaseUser.picture ?? null,
      role: isConfiguredAdmin || existingUserCount === 0 ? "ADMIN" : "USER"
    }
  });
}
