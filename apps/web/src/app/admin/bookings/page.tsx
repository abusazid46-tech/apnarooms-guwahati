"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch, apiPatch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking, Paginated } from "@/types/api";

const statuses: BackendBooking["status"][] = ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "REFUNDED"];

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BackendBooking[]>([]);

  async function loadBookings() {
    if (!user) return;
    const result = await apiFetch<Paginated<"bookings", BackendBooking>>("/bookings/admin?limit=100", { user });
    setBookings(result.bookings);
  }

  useEffect(() => {
    loadBookings().catch(() => {});
  }, [user]);

  async function updateStatus(id: string, status: BackendBooking["status"]) {
    if (!user) return;
    await apiPatch(`/bookings/admin/${id}`, { status }, { user });
    await loadBookings();
  }

  return (
    <AdminShell active="/admin/bookings">
      <section className="admin-main">
        <header className="admin-topbar"><div><p>Token flow</p><h1>Bookings</h1></div></header>
        <section className="admin-panel">
          <div className="admin-panel-head"><h2>All Bookings</h2><span>{bookings.length} records</span></div>
          <div className="lead-table">
            <div className="lead-row head"><span>Tenant</span><span>Property</span><span>Amount</span><span>Status</span></div>
            {bookings.map((booking) => (
              <div className="lead-row" key={booking.id}>
                <span>{booking.tenant?.name ?? booking.tenant?.phone ?? booking.tenant?.email ?? "Tenant"}</span>
                <span>{booking.property.title}</span>
                <span>INR {booking.tokenAmount.toLocaleString("en-IN")}</span>
                <select value={booking.status} onChange={(e) => updateStatus(booking.id, e.target.value as BackendBooking["status"])}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
