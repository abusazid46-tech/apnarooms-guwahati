"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api";
import type { BackendCoupon } from "@/types/api";

type OfferForm = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: string;
  maxDiscount: string;
  expiresAt: string;
  isActive: boolean;
};

const initialForm: OfferForm = {
  code: "",
  type: "FLAT",
  value: "",
  maxDiscount: "",
  expiresAt: "",
  isActive: true
};

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function offerLabel(coupon: Pick<BackendCoupon, "type" | "value" | "maxDiscount">) {
  if (coupon.type === "FLAT") return `${formatMoney(coupon.value)} off`;
  return `${coupon.value}% off${coupon.maxDiscount ? ` up to ${formatMoney(coupon.maxDiscount)}` : ""}`;
}

function formatDate(value?: string | null) {
  if (!value) return "No expiry";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function couponToForm(coupon: BackendCoupon): OfferForm {
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    isActive: coupon.isActive
  };
}

export default function AdminOffersPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<BackendCoupon[]>([]);
  const [form, setForm] = useState<OfferForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    if (!user) return;
    const result = await apiFetch<{ coupons: BackendCoupon[] }>("/coupons/admin", { user });
    setCoupons(result.coupons);
  }

  useEffect(() => {
    loadCoupons().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load offers."));
  }, [user]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function buildPayload() {
    return {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59.000Z`).toISOString() : null,
      isActive: form.isActive
    };
  }

  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(editingId ? "Updating offer..." : "Creating offer...");

    try {
      if (editingId) {
        await apiPatch(`/coupons/admin/${editingId}`, buildPayload(), { user });
        setMessage("Offer updated.");
      } else {
        await apiPost("/coupons/admin", buildPayload(), { user });
        setMessage("Offer created.");
      }
      resetForm();
      await loadCoupons();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Offer save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleOffer(coupon: BackendCoupon) {
    if (!user) return;
    await apiPatch(`/coupons/admin/${coupon.id}`, { isActive: !coupon.isActive }, { user });
    await loadCoupons();
  }

  async function deactivateOffer(coupon: BackendCoupon) {
    if (!user) return;
    await apiDelete(`/coupons/admin/${coupon.id}`, { user });
    await loadCoupons();
  }

  return (
    <AdminShell active="/admin/offers">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Promotions</p><h1>Offers & Coupons</h1></div>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>{editingId ? "Edit Offer" : "Create Offer"}</h2>
            <span>{message}</span>
          </div>
          <form className="admin-form offer-form-grid" onSubmit={saveOffer}>
            <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Coupon code, e.g. APNA500" required />
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as OfferForm["type"] })}>
              <option value="FLAT">Flat discount</option>
              <option value="PERCENT">Percentage discount</option>
            </select>
            <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} inputMode="numeric" placeholder={form.type === "FLAT" ? "Discount amount" : "Discount percentage"} required />
            <input value={form.maxDiscount} onChange={(event) => setForm({ ...form, maxDiscount: event.target.value })} inputMode="numeric" placeholder="Max discount, optional" />
            <input value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} type="date" />
            <label><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active offer</label>
            <div className="admin-form-actions">
              <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}</button>
              {editingId ? <button type="button" onClick={resetForm}>Cancel Edit</button> : null}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>All Offers</h2><span>{coupons.length} total</span></div>
          <div className="lead-table offer-table">
            <div className="lead-row offer-row head"><span>Code</span><span>Discount</span><span>Expiry</span><span>Status</span><span>Actions</span></div>
            {coupons.map((coupon) => (
              <div className="lead-row offer-row" key={coupon.id}>
                <span><strong>{coupon.code}</strong></span>
                <span>{offerLabel(coupon)}</span>
                <span>{formatDate(coupon.expiresAt)}</span>
                <span>{coupon.isActive ? "Active" : "Inactive"}</span>
                <span className="admin-actions">
                  <button type="button" onClick={() => {
                    setEditingId(coupon.id);
                    setForm(couponToForm(coupon));
                    setMessage(`Editing ${coupon.code}`);
                  }}>Edit</button>
                  <button type="button" onClick={() => toggleOffer(coupon)}>{coupon.isActive ? "Pause" : "Activate"}</button>
                  <button type="button" onClick={() => deactivateOffer(coupon)}>Deactivate</button>
                </span>
              </div>
            ))}
            {!coupons.length ? <div className="lead-row offer-row"><span>No offers created yet.</span></div> : null}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
