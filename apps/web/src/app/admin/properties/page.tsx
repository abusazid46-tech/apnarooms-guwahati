"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BackendProperty, Paginated } from "@/types/api";

const initialForm = {
  title: "",
  category: "PG",
  rentMonthly: "7500",
  tokenAmount: "750",
  locality: "Zoo Road",
  address: "",
  amenities: "WiFi Available, Meals Included",
  images: "",
  status: "PUBLISHED",
  isVerified: true,
  isAvailable: true
};

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  async function loadProperties() {
    if (!user) return;
    const result = await apiFetch<Paginated<"properties", BackendProperty>>("/properties/admin?limit=100", { user });
    setProperties(result.properties);
  }

  useEffect(() => {
    loadProperties().catch(() => {});
  }, [user]);

  async function createProperty(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    const images = form.images
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, index) => ({ url, sortOrder: index }));

    await apiPost(
      "/properties",
      {
        title: form.title,
        category: form.category,
        rentMonthly: Number(form.rentMonthly),
        tokenAmount: Number(form.tokenAmount),
        locality: form.locality,
        address: form.address || undefined,
        status: form.status,
        isVerified: form.isVerified,
        isAvailable: form.isAvailable,
        amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images
      },
      { user }
    );

    setForm(initialForm);
    setMessage("Property created.");
    await loadProperties();
  }

  async function updateStatus(property: BackendProperty, status: BackendProperty["status"]) {
    if (!user) return;
    await apiPatch(`/properties/${property.id}`, { status }, { user });
    await loadProperties();
  }

  async function archiveProperty(property: BackendProperty) {
    if (!user) return;
    await apiDelete(`/properties/${property.id}`, { user });
    await loadProperties();
  }

  return (
    <AdminShell active="/admin/properties">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Inventory</p><h1>Manage Properties</h1></div>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Create Property</h2><span>{message}</span></div>
          <form className="admin-form" onSubmit={createProperty}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Property title" required />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="PG">PG</option>
              <option value="HOMESTAY">Homestay</option>
              <option value="FLAT">Flat</option>
              <option value="ROOM">Room</option>
            </select>
            <input value={form.rentMonthly} onChange={(e) => setForm({ ...form, rentMonthly: e.target.value })} placeholder="Monthly rent" />
            <input value={form.tokenAmount} onChange={(e) => setForm({ ...form, tokenAmount: e.target.value })} placeholder="Token amount" />
            <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Locality" />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Amenities comma separated" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="UNPUBLISHED">Unpublished</option>
            </select>
            <label><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} /> Verified</label>
            <label><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available</label>
            <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="Image URLs, one per line" />
            <button type="submit">Create Property</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Properties</h2><span>{properties.length} total</span></div>
          <div className="admin-card-list">
            {properties.map((property) => (
              <article key={property.id}>
                <img src={property.images[0]?.url ?? "https://picsum.photos/id/164/500/350"} alt="" />
                <div>
                  <h3>{property.title}</h3>
                  <p>{property.locality} | INR {property.rentMonthly.toLocaleString("en-IN")} | {property.status}</p>
                  <div className="admin-actions">
                    <button type="button" onClick={() => updateStatus(property, "PUBLISHED")}>Publish</button>
                    <button type="button" onClick={() => updateStatus(property, "UNPUBLISHED")}>Unpublish</button>
                    <button type="button" onClick={() => archiveProperty(property)}>Archive</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
