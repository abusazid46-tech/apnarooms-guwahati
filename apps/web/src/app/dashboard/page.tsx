"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking } from "@/types/api";

export default function TenantDashboardPage() {
  const { user, profile, loading } = useAuth();
  const [bookings, setBookings] = useState<BackendBooking[]>([]);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ bookings: BackendBooking[] }>("/bookings/me", { user })
      .then((result) => setBookings(result.bookings))
      .catch(() => {});
  }, [user]);

  if (loading) return <main className="tenant-dashboard"><p>Loading...</p></main>;
  if (!user) {
    return (
      <main className="tenant-dashboard">
        <section className="dashboard-card">
          <h1>Login required</h1>
          <a className="btn-book-lux" href="/login">Login</a>
        </section>
      </main>
    );
  }

  return (
    <main className="tenant-dashboard">
      <section className="dashboard-card">
        <div className="dashboard-head">
          <div>
            <p>Tenant dashboard</p>
            <h1>My Bookings</h1>
            <span>{profile?.name ?? user.email ?? user.phoneNumber}</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
              await signOut(auth);
            }}
          >
            Logout
          </button>
        </div>
        <div className="booking-list">
          {bookings.length ? bookings.map((booking) => (
            <article key={booking.id}>
              {booking.property.images[0]?.url ? (
                <img src={booking.property.images[0].url} alt={booking.property.title} />
              ) : (
                <div className="admin-thumb-placeholder">Photos pending</div>
              )}
              <div>
                <h3>{booking.property.title}</h3>
                <p>{booking.property.locality} | INR {booking.tokenAmount.toLocaleString("en-IN")}</p>
                <strong>{booking.status}</strong>
              </div>
            </article>
          )) : <p>No bookings yet. Book a property from the homepage.</p>}
        </div>
      </section>
    </main>
  );
}
