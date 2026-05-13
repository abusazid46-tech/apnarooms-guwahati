import { prisma } from "@apnarooms/db";

type FirebaseUser = {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
};

export async function syncUser(firebaseUser: FirebaseUser) {
  return prisma.user.upsert({
    where: { firebaseUid: firebaseUser.uid },
    update: {
      email: firebaseUser.email ?? null,
      phone: firebaseUser.phone_number ?? null,
      name: firebaseUser.name ?? null,
      avatarUrl: firebaseUser.picture ?? null
    },
    create: {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email ?? null,
      phone: firebaseUser.phone_number ?? null,
      name: firebaseUser.name ?? null,
      avatarUrl: firebaseUser.picture ?? null
    }
  });
}
