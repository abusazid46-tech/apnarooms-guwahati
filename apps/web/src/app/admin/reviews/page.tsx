"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiFetch, apiPatch } from "@/lib/api";
import type { BackendReview, Paginated } from "@/types/api";

const statuses: BackendReview["status"][] = ["PENDING", "APPROVED", "REJECTED"];

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<BackendReview["status"] | "ALL">("PENDING");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!user) return;
    const query = statusFilter === "ALL" ? "" : `&status=${statusFilter}`;
    const result = await apiFetch<Paginated<"reviews", BackendReview>>(`/reviews/admin?limit=100${query}`, { user });
    setReviews(result.reviews);
  }

  useEffect(() => {
    load().catch(() => setNotice("Could not load customer reviews."));
  }, [statusFilter, user]);

  async function updateStatus(id: string, status: BackendReview["status"]) {
    if (!user) return;
    setNotice("");
    await apiPatch(`/reviews/admin/${id}`, { status }, { user });
    await load();
  }

  async function removeReview(id: string) {
    if (!user) return;
    setNotice("");
    await apiDelete(`/reviews/admin/${id}`, { user });
    await load();
  }

  return (
    <AdminShell active="/admin/reviews">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Customer feedback</p><h1>Review Moderation</h1></div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as BackendReview["status"] | "ALL")}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Customer Reviews</h2><span>{reviews.length} records</span></div>
          {notice ? <p className="admin-form-note">{notice}</p> : null}
          <div className="lead-table">
            <div className="lead-row head"><span>Reviewer</span><span>Property</span><span>Status</span><span>Action</span></div>
            {reviews.map((review) => (
              <div className="lead-row" key={review.id}>
                <span>
                  <strong>{review.name}</strong>
                  <small>{review.rating}/5 - {review.body}</small>
                </span>
                <span>{review.property ? `${review.property.title} (${review.property.locality})` : "General review"}</span>
                <select value={review.status} onChange={(event) => updateStatus(review.id, event.target.value as BackendReview["status"])}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="button" onClick={() => removeReview(review.id)}>Delete</button>
              </div>
            ))}
            {!reviews.length ? <p className="admin-form-note">No customer reviews in this view.</p> : null}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
