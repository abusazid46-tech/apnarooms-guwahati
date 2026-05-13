"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendPayment, Paginated } from "@/types/api";

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<BackendPayment[]>([]);

  useEffect(() => {
    if (!user) return;
    apiFetch<Paginated<"payments", BackendPayment>>("/payments/admin?limit=100", { user })
      .then((result) => setPayments(result.payments))
      .catch(() => {});
  }, [user]);

  return (
    <AdminShell active="/admin/payments">
      <section className="admin-main">
        <header className="admin-topbar"><div><p>Razorpay</p><h1>Payments</h1></div></header>
        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Payment Records</h2><span>{payments.length} records</span></div>
          <div className="lead-table">
            <div className="lead-row head"><span>Order</span><span>Property</span><span>Amount</span><span>Status</span></div>
            {payments.map((payment) => (
              <div className="lead-row" key={payment.id}>
                <span>{payment.providerOrderId}</span>
                <span>{payment.booking?.property.title ?? "-"}</span>
                <span>INR {payment.amount.toLocaleString("en-IN")}</span>
                <span>{payment.status}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
