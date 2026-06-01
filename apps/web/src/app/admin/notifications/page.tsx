"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, apiPatch } from "@/lib/api";
import type { BackendNotification } from "@/types/api";

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function eventLabel(type: string) {
  return type.replaceAll("_", " ").toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [message, setMessage] = useState("");

  async function loadNotifications() {
    if (!user) return;
    const result = await apiFetch<{ notifications: BackendNotification[]; unreadCount: number }>("/notifications/admin", { user });
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
  }

  useEffect(() => {
    loadNotifications().catch(() => setMessage("Unable to load notifications."));
  }, [user]);

  async function markRead(id: string) {
    if (!user) return;
    await apiPatch(`/notifications/admin/${id}/read`, {}, { user });
    await loadNotifications();
  }

  async function markAllRead() {
    if (!user) return;
    await apiPatch("/notifications/admin/read-all", {}, { user });
    await loadNotifications();
  }

  return (
    <AdminShell active="/admin/notifications">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Events</p><h1>Notifications</h1></div>
          <button type="button" className="admin-button" onClick={markAllRead} disabled={!unreadCount}>Mark All Read</button>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Recent Events</h2><span>{unreadCount} unread</span></div>
          {message ? <p className="auth-message">{message}</p> : null}
          <div className="notification-list">
            {notifications.length ? notifications.map((notification) => (
              <article className={notification.readAt ? "notification-item" : "notification-item unread"} key={notification.id}>
                <div>
                  <span>{eventLabel(notification.type)} | {formatTime(notification.createdAt)}</span>
                  <h3>{notification.title}</h3>
                  {notification.body ? <p>{notification.body}</p> : null}
                </div>
                <div className="notification-actions">
                  {notification.href ? <a href={notification.href}>Open</a> : null}
                  {!notification.readAt ? <button type="button" onClick={() => markRead(notification.id)}>Mark Read</button> : <span>Read</span>}
                </div>
              </article>
            )) : (
              <div className="dashboard-empty-state">
                <h3>No notifications yet</h3>
                <p>New bookings and owner property submissions will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
