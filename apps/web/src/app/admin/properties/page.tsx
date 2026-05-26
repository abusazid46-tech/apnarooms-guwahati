"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api";
import { uploadPropertyImage } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import type { BackendProperty, Paginated } from "@/types/api";

type UploadDiagnostic = {
  status: "info" | "success" | "error";
  message: string;
  url?: string;
};

const initialForm = {
  title: "",
  description: "",
  category: "PG",
  rentMonthly: "7500",
  depositAmount: "",
  tokenAmount: "750",
  locality: "Zoo Road",
  city: "Guwahati",
  address: "",
  amenities: "WiFi Available, Meals Included",
  imageUrls: "",
  status: "PUBLISHED",
  isVerified: true,
  isAvailable: true
};

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [form, setForm] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [uploadDiagnostics, setUploadDiagnostics] = useState<UploadDiagnostic[]>([]);
  const [saving, setSaving] = useState(false);

  function addUploadDiagnostic(diagnostic: UploadDiagnostic) {
    setUploadDiagnostics((current) => [...current, diagnostic]);
  }

  async function loadProperties() {
    if (!user) return;
    const result = await apiFetch<Paginated<"properties", BackendProperty>>("/properties/admin?limit=100", { user });
    console.info("[ApnaRooms upload] Loaded admin properties", {
      propertyCount: result.properties.length,
      firstPropertyImage: result.properties[0]?.images[0]?.url
    });
    setProperties(result.properties);
  }

  useEffect(() => {
    loadProperties().catch(() => {});
  }, [user]);

  function updateImageFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setImageFiles(files);
    setUploadDiagnostics(
      files.length
        ? files.map((file) => ({
            status: "info",
            message: `Selected ${file.name} (${Math.round(file.size / 1024)} KB)`
          }))
        : []
    );
    console.info("[ApnaRooms upload] Selected create image files", files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type
    })));
  }

  async function createProperty(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("Creating property...");
    setUploadDiagnostics([]);
    console.info("[ApnaRooms upload] Create property started", {
      selectedFileCount: imageFiles.length
    });

    const images = form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, index) => ({ url, sortOrder: index }));

    try {
      addUploadDiagnostic({ status: "info", message: "Creating backend property record..." });
      const result = await apiPost<{ property: BackendProperty }>(
        "/properties",
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

      console.info("[ApnaRooms upload] Backend property created", {
        propertyId: result.property.id,
        imageCount: result.property.images.length
      });
      addUploadDiagnostic({ status: "success", message: `Backend property created: ${result.property.id}` });

      for (const [index, file] of imageFiles.entries()) {
        setMessage(`Uploading image ${index + 1} of ${imageFiles.length}...`);
        addUploadDiagnostic({ status: "info", message: `Uploading ${file.name} to Cloudinary...` });
        const url = await uploadPropertyImage(file, result.property.id);
        addUploadDiagnostic({ status: "success", message: `Cloudinary upload success: ${file.name}`, url });
        const imageResult = await apiPost<{ image: { url: string } }>(`/properties/${result.property.id}/images`, {
          url,
          alt: result.property.title,
          sortOrder: images.length + index
        }, { user });
        console.info("[ApnaRooms upload] Backend image saved", {
          propertyId: result.property.id,
          imageUrl: imageResult.image.url
        });
        addUploadDiagnostic({ status: "success", message: "Backend image URL saved.", url: imageResult.image.url });
      }

      setForm(initialForm);
      setImageFiles([]);
      setMessage("Property created and published.");
      await loadProperties();
    } catch (error) {
      console.error("[ApnaRooms upload] Create property image save failed", error);
      addUploadDiagnostic({
        status: "error",
        message: error instanceof Error ? error.message : "Property creation failed."
      });
      setMessage(error instanceof Error ? error.message : "Property creation failed.");
    } finally {
      setSaving(false);
    }
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
            </select>
            <label><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} /> Verified</label>
            <label><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available</label>
            <textarea value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} placeholder="Image URLs, one per line" />
            <label className="admin-file-field">
              <span>Upload property photos</span>
              <input type="file" accept="image/*" multiple onChange={updateImageFiles} />
            </label>
            <p className="admin-form-note">Photos upload to Cloudinary and are saved to the live property. Image URLs still work.</p>
            {imageFiles.length > 0 ? <p className="admin-form-note">{imageFiles.length} image file{imageFiles.length > 1 ? "s" : ""} selected.</p> : null}
            {uploadDiagnostics.length > 0 ? (
              <div className="admin-upload-diagnostics">
                <strong>Upload diagnostics</strong>
                {uploadDiagnostics.map((item, index) => (
                  <div className={`admin-upload-log ${item.status}`} key={`${item.message}-${index}`}>
                    <span>{item.message}</span>
                    {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a> : null}
                  </div>
                ))}
              </div>
            ) : null}
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Property"}</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><h2>Properties</h2><span>{properties.length} total</span></div>
          <div className="admin-card-list">
            {properties.map((property) => (
              <article key={property.id}>
                {property.images[0]?.url ? (
                  <img src={property.images[0].url} alt={property.title} />
                ) : (
                  <div className="admin-thumb-placeholder">Photos pending</div>
                )}
                <div>
                  <h3>{property.title}</h3>
                  <p>{property.locality} | INR {property.rentMonthly.toLocaleString("en-IN")} | {property.status}</p>
                  <div className="admin-actions">
                    <a className="admin-inline-link" href={`/admin/properties/${property.id}/edit`}>Edit</a>
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
