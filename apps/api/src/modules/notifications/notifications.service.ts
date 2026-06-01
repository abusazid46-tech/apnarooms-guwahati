import { prisma } from "@apnarooms/db";
import { ApiError } from "../../utils/api-error.js";

type NotificationInput = {
  type: string;
  title: string;
  body?: string;
  href?: string;
};

export async function createAdminNotification(input: NotificationInput) {
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
  const notification = await prisma.adminNotification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, "Notification not found");

  return prisma.adminNotification.update({
    where: { id },
    data: { readAt: notification.readAt ?? new Date() }
  });
}

export async function markAllNotificationsRead() {
  await prisma.adminNotification.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() }
  });
}
