"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, apiPatch, apiPost } from "@/lib/api";
import { uploadPropertyImage } from "@/lib/storage";
import type { BackendProperty } from "@/types/api";

const initialForm = {
  title: "",
  description: "",
  category: "PG",
  rentMonthly: "",
  depositAmount: "",
  tokenAmount: "",
  locality: "",
  city: "Guwahati",
  address: "",
  amenities: "",
  imageUrls: "",
  status: "PUBLISHED",
  isVerified: true,
  isAvailable: true
};

function propertyToForm(property: BackendProperty) {
  return {
    title: property.title,
    description: property.description ?? "",
    category: property.category,
    rentMonthly: String(property.rentMonthly),
    depositAmount: property.depositAmount ? String(property.depositAmount) : "",
    tokenAmount: String(property.tokenAmount),
    locality: property.locality,
    city: property.city,
    address: property.address ?? "",
    amenities: property.amenities.join(", "),
    imageUrls: property.images.map((image) => image.url).join("\n"),
    status: property.status,
    isVerified: property.isVerified,
    isAvailable: property.isAvailable
  };
}

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<BackendProperty | null>(null);
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProperty() {
    if (!user || !params.id) return;
    const result = await apiFetch<{ property: BackendProperty }>(`/properties/admin/${params.id}`, { user });
    setProperty(result.property);
    setForm(propertyToForm(result.property));
  }

  useEffect(() => {
    loadProperty().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load property."));
  }, [user, params.id]);

  function updateImageFiles(event: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []));
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    if (!user || !property) return;
    setSaving(true);
    setMessage("Saving property...");

    const images = form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, index) => ({ url, sortOrder: index, alt: form.title }));

    try {
      const result = await apiPatch<{ property: BackendProperty }>(
        `/properties/${property.id}`,
        {
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          rentMonthly: Number(form.rentMonthly),
          depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
          tokenAmount: Number(form.tokenAmount),
          locality: form.locality,
          city: form.city,
          address: form.address || undefined,
          status: form.status,
          isVerified: form.isVerified,
          isAvailable: form.isAvailable,
          amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
          images
        },
        { user }
      );

      for (const [index, file] of imageFiles.entries()) {
        setMessage(`Uploading image ${index + 1} of ${imageFiles.length}...`);
        const url = await uploadPropertyImage(file, result.property.id);
        await apiPost(`/properties/${result.property.id}/images`, {
          url,
          alt: result.property.title,
          sortOrder: images.length + index
        }, { user });
      }

      setImageFiles([]);
      setMessage("Property updated.");
      await loadProperty();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Property update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell active="/admin/properties">
      <section className="admin-main">
        <header className="admin-topbar">
          <div><p>Inventory</p><h1>Edit Property</h1></div>
          <a className="admin-button" href="/admin/properties">Back to Properties</a>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>{property?.title ?? "Loading property"}</h2><span>{message}</span></div>
          <form className="admin-form" onSubmit={saveProperty}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Property title" required />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short listing description" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="PG">PG</option>
              <option value="HOMESTAY">Homestay</option>
              <option value="FLAT">Flat</option>
              <option value="ROOM">Room</option>
            </select>
            <input value={form.rentMonthly} onChange={(e) => setForm({ ...form, rentMonthly: e.target.value })} placeholder="Monthly rent" />
            <input value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} placeholder="Deposit amount" />
            <input value={form.tokenAmount} onChange={(e) => setForm({ ...form, tokenAmount: e.target.value })} placeholder="Token amount" />
            <input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="Locality" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Amenities comma separated" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="UNPUBLISHED">Unpublished</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <label><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} /> Verified</label>
            <label><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available</label>
            <textarea value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} placeholder="Image URLs, one per line" />
            <label className="admin-file-field">
              <span>Upload more property photos</span>
              <input type="file" accept="image/*" multiple onChange={updateImageFiles} />
            </label>
            <p className="admin-form-note">Photos upload to Cloudinary and are saved to the live property. Image URLs still work.</p>
            {imageFiles.length > 0 ? <p className="admin-form-note">{imageFiles.length} image file{imageFiles.length > 1 ? "s" : ""} selected.</p> : null}
            <button type="submit" disabled={saving || !property}>{saving ? "Saving..." : "Save Property"}</button>
          </form>
        </section>
      </section>
    </AdminShell>
  );
}
