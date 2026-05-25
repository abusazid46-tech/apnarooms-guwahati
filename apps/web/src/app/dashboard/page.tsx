"use client";

import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking } from "@/types/api";

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

async function logout() {
  const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
  await signOut(auth);
  window.location.href = "/";
}

export default function TenantDashboardPage() {
  const { user, profile, loading } = useAuth();
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    apiFetch<{ bookings: BackendBooking[] }>("/bookings/me", { user })
      .then((result) => setBookings(result.bookings))
      .catch(() => setMessage("Unable to load bookings right now."));
  }, [user]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
    const pending = bookings.filter((booking) => booking.status === "PENDING_PAYMENT").length;
    const paidAmount = bookings
      .filter((booking) => booking.payment?.status === "PAID")
      .reduce((sum, booking) => sum + booking.tokenAmount, 0);

    return { total: bookings.length, confirmed, pending, paidAmount };
  }, [bookings]);

  if (loading) return <main className="tenant-dashboard"><p>Loading dashboard...</p></main>;

  if (!user) {
    return (
      <main className="tenant-dashboard dashboard-page">
        <nav className="dashboard-navbar">
          <a className="dashboard-brand" href="/">ApnaRooms.com</a>
          <a href="/">Home</a>
        </nav>
        <section className="dashboard-card dashboard-empty-state">
          <h1>Login Required</h1>
          <p>Login to view bookings, payment status, and saved property activity.</p>
          <a className="admin-button" href="/login?next=/dashboard">Login</a>
        </section>
      </main>
    );
  }

  return (
    <main className="tenant-dashboard dashboard-page">
      <nav className="dashboard-navbar">
        <a className="dashboard-brand" href="/">ApnaRooms.com</a>
        <div>
          <a href="/">Home</a>
          <a href="/#listings">Listings</a>
          <a href="/about">About</a>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard-card">
        <div className="dashboard-head">
          <div>
            <p>Tenant dashboard</p>
            <h1>My Booking Center</h1>
            <span>{profile?.name ?? user.email ?? user.phoneNumber}</span>
          </div>
          <a className="admin-button" href="/#listings">Book Another Stay</a>
        </div>

        <div className="dashboard-stat-grid">
          <article><span>Total Bookings</span><strong>{stats.total}</strong></article>
          <article><span>Confirmed</span><strong>{stats.confirmed}</strong></article>
          <article><span>Pending Payment</span><strong>{stats.pending}</strong></article>
          <article><span>Paid Tokens</span><strong>{formatMoney(stats.paidAmount)}</strong></article>
        </div>

        {message ? <p className="auth-message">{message}</p> : null}

        <div className="dashboard-section-head">
          <div>
            <span>Recent activity</span>
            <h2>Bookings</h2>
          </div>
        </div>

        <div className="booking-list dashboard-booking-list">
          {bookings.length ? bookings.map((booking) => (
            <article key={booking.id}>
              {booking.property.images[0]?.url ? (
                <img src={booking.property.images[0].url} alt={booking.property.title} />
              ) : (
                <div className="admin-thumb-placeholder">Photos pending</div>
              )}
              <div className="dashboard-booking-body">
                <div>
                  <h3>{booking.property.title}</h3>
                  <p>{booking.property.locality} | Token {formatMoney(booking.tokenAmount)}</p>
                </div>
                <div className="dashboard-booking-meta">
                  <span className={`booking-status-chip status-${booking.status.toLowerCase().replace("_", "-")}`}>{booking.status.replace("_", " ")}</span>
                  <small>{booking.payment?.status ? `Payment: ${booking.payment.status}` : "Payment not created"}</small>
                </div>
              </div>
            </article>
          )) : (
            <div className="dashboard-empty-state">
              <h3>No bookings yet</h3>
              <p>Choose a verified property and complete secure token checkout to see it here.</p>
              <a className="admin-button" href="/#listings">Browse Listings</a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
