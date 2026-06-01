"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking, BackendLead, BackendNotification, BackendPayment, BackendProperty, BackendUser, Paginated } from "@/types/api";

export default function AdminPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [leads, setLeads] = useState<BackendLead[]>([]);
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch<Paginated<"properties", BackendProperty>>("/properties/admin?limit=100", { user }),
      apiFetch<Paginated<"bookings", BackendBooking>>("/bookings/admin?limit=100", { user }),
      apiFetch<Paginated<"leads", BackendLead>>("/leads/admin?limit=100", { user }),
      apiFetch<Paginated<"payments", BackendPayment>>("/payments/admin?limit=100", { user }),
      apiFetch<{ users: BackendUser[] }>("/users/admin", { user }),
      apiFetch<{ notifications: BackendNotification[]; unreadCount: number }>("/notifications/admin", { user })
    ]).then(([propertyResult, bookingResult, leadResult, paymentResult, userResult, notificationResult]) => {
      setProperties(propertyResult.properties);
      setBookings(bookingResult.bookings);
      setLeads(leadResult.leads);
      setPayments(paymentResult.payments);
      setUsers(userResult.users);
      setNotifications(notificationResult.notifications);
      setUnreadCount(notificationResult.unreadCount);
    }).catch(() => {});
  }, [user]);

  const leadCounts = useMemo(() => {
    return leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.status] = (acc[lead.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [leads]);

  return (
    <AdminShell active="/admin">
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>Operations CRM</p>
            <h1>Admin Dashboard</h1>
          </div>
          <a className="admin-button" href="/admin/properties">Add Property</a>
        </header>

        <div className="admin-stat-grid">
          <article><span>Properties</span><strong>{properties.length}</strong><small>Inventory</small></article>
          <article><span>Bookings</span><strong>{bookings.length}</strong><small>All time</small></article>
          <article><span>Leads</span><strong>{leads.length}</strong><small>CRM desk</small></article>
          <article><span>Alerts</span><strong>{unreadCount}</strong><small>Unread events</small></article>
        </div>

        <div className="admin-two-col">
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>CRM Pipeline</h2><span>Live funnel</span></div>
            <div className="pipeline-list">
              {["NEW", "CONTACTED", "VISIT_SCHEDULED", "NEGOTIATION", "TOKEN_PAID", "MOVED_IN"].map((stage) => (
                <div key={stage}><span>{stage.replaceAll("_", " ")}</span><strong>{leadCounts[stage] ?? 0}</strong></div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Team</h2><span>Users</span></div>
            <div className="pipeline-list">
              {["ADMIN", "SALES", "SUPPORT", "LANDLORD", "USER"].map((role) => (
                <div key={role}><span>{role}</span><strong>{users.filter((item) => item.role === role).length}</strong></div>
              ))}
            </div>
          </section>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Latest Notifications</h2><a href="/admin/notifications">Open Notifications</a></div>
          <div className="notification-list compact">
            {notifications.slice(0, 5).map((notification) => (
              <article className={notification.readAt ? "notification-item" : "notification-item unread"} key={notification.id}>
                <div>
                  <span>{notification.type.replaceAll("_", " ")}</span>
                  <h3>{notification.title}</h3>
                  {notification.body ? <p>{notification.body}</p> : null}
                </div>
                {notification.href ? <a href={notification.href}>Open</a> : null}
              </article>
            ))}
            {!notifications.length ? <p className="admin-form-note">No recent events yet.</p> : null}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Latest Leads</h2><a href="/admin/leads">Open CRM</a></div>
          <div className="lead-table">
            <div className="lead-row head"><span>Name</span><span>Property</span><span>Status</span><span>Contact</span></div>
            {leads.slice(0, 6).map((lead) => (
              <div className="lead-row" key={lead.id}>
                <span>{lead.name ?? "Unknown"}</span>
                <span>{lead.property?.title ?? "General"}</span>
                <span>{lead.status}</span>
                <span>{lead.phone ?? lead.email ?? "-"}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
