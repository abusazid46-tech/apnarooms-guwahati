"use client";

import { ReactNode } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAdminGuard } from "@/hooks/useAdminGuard";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/properties", "Properties"],
  ["/admin/bookings", "Bookings"],
  ["/admin/offers", "Offers"],
  ["/admin/leads", "CRM Leads"],
  ["/admin/users", "Users"],
  ["/admin/payments", "Payments"],
  ["/", "Tenant Website"]
];

export function AdminShell({ children, active }: { children: ReactNode; active: string }) {
  const { user, profile, loading, isAdmin } = useAdminGuard();

  if (loading) {
    return <main className="admin-gate">Checking admin session...</main>;
  }

  if (!user) {
    return (
      <main className="admin-gate">
        <h1>Admin login required</h1>
        <a href="/login">Login</a>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-gate">
        <h1>No admin access</h1>
        <p>Your current role is {profile?.role ?? "USER"}.</p>
        <a href="/">Back to tenant website</a>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>AR</span>
          <strong>ApnaRooms Admin</strong>
        </div>
        <nav>
          {links.map(([href, label]) => (
            <a className={active === href ? "active" : ""} href={href} key={href}>
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={async () => {
              const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
              await signOut(auth);
            }}
          >
            Logout
          </button>
        </nav>
      </aside>
      {children}
    </main>
  );
}
