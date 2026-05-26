"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, apiPatch } from "@/lib/api";
import { uploadPropertyImage } from "@/lib/storage";
import type { BackendProperty } from "@/types/api";

type UploadDiagnostic = {
  status: "info" | "success" | "error";
  message: string;
  url?: string;
};

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
  const [uploadDiagnostics, setUploadDiagnostics] = useState<UploadDiagnostic[]>([]);
  const [saving, setSaving] = useState(false);

  function addUploadDiagnostic(diagnostic: UploadDiagnostic) {
    setUploadDiagnostics((current) => [...current, diagnostic]);
  }

  async function loadProperty() {
    if (!user || !params.id) return;
    const result = await apiFetch<{ property: BackendProperty }>(`/properties/admin/${params.id}`, { user });
    console.info("[ApnaRooms upload] Loaded admin property", {
      propertyId: result.property.id,
      imageCount: result.property.images.length,
      firstImage: result.property.images[0]?.url
    });
    setProperty(result.property);
    setForm(propertyToForm(result.property));
  }

  useEffect(() => {
    loadProperty().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load property."));
  }, [user, params.id]);

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
    console.info("[ApnaRooms upload] Selected edit image files", files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type
    })));
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    if (!user || !property) return;
    setSaving(true);
    setMessage("Saving property...");
    setUploadDiagnostics([]);
    console.info("[ApnaRooms upload] Edit save started", {
      propertyId: property.id,
      selectedFileCount: imageFiles.length,
      existingImageCount: property.images.length
    });

    const existingImages = form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.title }));

    try {
      const uploadedImages = [];

      for (const [index, file] of imageFiles.entries()) {
        setMessage(`Uploading image ${index + 1} of ${imageFiles.length}...`);
        addUploadDiagnostic({ status: "info", message: `Uploading ${file.name} to Cloudinary...` });
        const url = await uploadPropertyImage(file, property.id);
        addUploadDiagnostic({ status: "success", message: `Cloudinary upload success: ${file.name}`, url });
        uploadedImages.push({ url, alt: form.title });
      }

      const images = [...uploadedImages, ...existingImages].map((image, index) => ({
        ...image,
        sortOrder: index
      }));

      addUploadDiagnostic({ status: "info", message: `Saving ${images.length} image URL${images.length === 1 ? "" : "s"} to backend...` });
      console.info("[ApnaRooms upload] Saving edited property images to backend", {
        propertyId: property.id,
        imageCount: images.length,
        firstImage: images[0]?.url
      });

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

      console.info("[ApnaRooms upload] Backend saved edited property", {
        propertyId: result.property.id,
        imageCount: result.property.images.length,
        firstImage: result.property.images[0]?.url
      });
      addUploadDiagnostic({
        status: "success",
        message: `Backend saved ${result.property.images.length} image URL${result.property.images.length === 1 ? "" : "s"}. First frontend image is below.`,
        url: result.property.images[0]?.url
      });
      setImageFiles([]);
      setMessage(result.property.images.length ? "Property updated. New photos are now first in the gallery." : "Property updated.");
      await loadProperty();
    } catch (error) {
      console.error("[ApnaRooms upload] Edit image save failed", error);
      addUploadDiagnostic({
        status: "error",
        message: error instanceof Error ? error.message : "Property update failed."
      });
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
            <button type="submit" disabled={saving || !property}>{saving ? "Saving..." : "Save Property"}</button>
          </form>
        </section>
      </section>
    </AdminShell>
  );
}
