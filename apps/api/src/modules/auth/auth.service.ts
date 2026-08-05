import { prisma } from "@apnarooms/db";
import { env } from "../../config/env.js";

export type FirebaseUser = {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
};

export function isConfiguredAdminUser(firebaseUser: FirebaseUser) {
  const normalizedEmail = firebaseUser.email?.toLowerCase() ?? null;
  return Boolean(normalizedEmail && env.ADMIN_EMAILS.includes(normalizedEmail));
}

function userLookup(firebaseUser: FirebaseUser) {
  const normalizedEmail = firebaseUser.email?.toLowerCase() ?? null;
  const normalizedPhone = firebaseUser.phone_number ?? null;

  return {
    OR: [
      { firebaseUid: firebaseUser.uid },
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
    ]
  };
}

export async function syncUser(firebaseUser: FirebaseUser) {
  const existingUserCount = await prisma.user.count();
  const normalizedEmail = firebaseUser.email?.toLowerCase() ?? null;
  const normalizedPhone = firebaseUser.phone_number ?? null;
  const isConfiguredAdmin = isConfiguredAdminUser(firebaseUser);

  if (isConfiguredAdmin && normalizedEmail) {
    const adminUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (adminUser) {
      return prisma.user.update({
        where: { id: adminUser.id },
        data: {
          phone: normalizedPhone,
          name: firebaseUser.name ?? adminUser.name,
          avatarUrl: firebaseUser.picture ?? adminUser.avatarUrl,
          role: "ADMIN"
        }
      });
    }
  }

  const userData = {
    firebaseUid: firebaseUser.uid,
    email: normalizedEmail,
    phone: normalizedPhone,
    name: firebaseUser.name ?? null,
    avatarUrl: firebaseUser.picture ?? null,
    ...(isConfiguredAdmin ? { role: "ADMIN" as const } : {})
  };

  const existingUser = await prisma.user.findFirst({
    where: userLookup(firebaseUser)
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: userData
    });
  }

  try {
    return await prisma.user.create({
      data: {
        ...userData,
        role: isConfiguredAdmin || existingUserCount === 0 ? "ADMIN" : "USER"
      }
    });
  } catch (error) {
    const conflictingUser = await prisma.user.findFirst({ where: userLookup(firebaseUser) });
    if (!conflictingUser) throw error;

    return prisma.user.update({
      where: { id: conflictingUser.id },
      data: userData
    });
  }
}
