import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type NotificationInput = {
  type: string;
  title: string;
  body?: string;
  href?: string;
};

let notificationStorageReady: Promise<void> | null = null;

export async function ensureNotificationStorage() {
  notificationStorageReady ??= (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminNotification" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "body" TEXT,
        "href" TEXT,
        "readAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminNotification_readAt_idx" ON "AdminNotification"("readAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminNotification_type_idx" ON "AdminNotification"("type");`);
  })();

  return notificationStorageReady;
}

export async function createAdminNotification(input: NotificationInput) {
  await ensureNotificationStorage();

  return prisma.adminNotification.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href
    }
  });
}

export async function listAdminNotifications() {
  await ensureNotificationStorage();

  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.adminNotification.count({ where: { readAt: null } })
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationRead(id: string) {
  await ensureNotificationStorage();

  const notification = await prisma.adminNotification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, "Notification not found");

  return prisma.adminNotification.update({
    where: { id },
    data: { readAt: notification.readAt ?? new Date() }
  });
}

export async function markAllNotificationsRead() {
  await ensureNotificationStorage();

  await prisma.adminNotification.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() }
  });
}
