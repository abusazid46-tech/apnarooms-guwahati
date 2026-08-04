"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { apiFetch, apiPatch, apiPost } from "@/lib/api";
import { isCloudinaryUploadConfigured, uploadPropertyImage } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking, BackendProperty } from "@/types/api";

const initialOwnerForm = {
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
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
  isAvailable: true
};

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function priceSuffix(property: Pick<BackendProperty, "category">) {
  return property.category === "HOMESTAY" ? "/day" : "/mo";
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function isPositiveNumber(value: string) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function propertyToOwnerForm(property: BackendProperty) {
  return {
    ownerName: property.ownerName ?? property.landlord?.name ?? "",
    ownerPhone: property.ownerPhone ?? property.landlord?.phone ?? "",
    ownerEmail: property.ownerEmail ?? property.landlord?.email ?? "",
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
    isAvailable: property.isAvailable
  };
}

async function logout() {
  const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
  await signOut(auth);
  window.location.href = "/";
}

export default function TenantDashboardPage() {
  const { user, profile, loading } = useAuth();
  const [bookings, setBookings] = useState<BackendBooking[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<BackendProperty[]>([]);
  const [ownerForm, setOwnerForm] = useState(initialOwnerForm);
  const [ownerImages, setOwnerImages] = useState<File[]>([]);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ownerMessage, setOwnerMessage] = useState("");
  const [ownerRequested, setOwnerRequested] = useState(false);
  const [ownerSaving, setOwnerSaving] = useState(false);

  const showOwnerTools = ownerRequested || profile?.role === "LANDLORD" || profile?.role === "ADMIN";

  async function loadOwnerProperties() {
    if (!user) return;
    const result = await apiFetch<{ properties: BackendProperty[] }>("/properties/owner", { user });
    setOwnerProperties(result.properties);
  }

  useEffect(() => {
    if (!user) return;
    apiFetch<{ bookings: BackendBooking[] }>("/bookings/me", { user })
      .then((result) => setBookings(result.bookings))
      .catch(() => setMessage("Unable to load bookings right now."));
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOwnerRequested(params.get("owner") === "1");
  }, []);

  useEffect(() => {
    if (!user || !ownerRequested) return;
    apiPost("/users/me/become-landlord", {}, { user })
      .then(() => loadOwnerProperties())
      .catch((error) => setOwnerMessage(error instanceof Error ? error.message : "Unable to start owner dashboard."));
  }, [ownerRequested, user]);

  useEffect(() => {
    if (!user || !showOwnerTools) return;
    loadOwnerProperties().catch(() => {});
  }, [showOwnerTools, user]);

  useEffect(() => {
    if (!user || !showOwnerTools || editingPropertyId) return;
    setOwnerForm((current) => ({
      ...current,
      ownerName: current.ownerName || profile?.name || user.displayName || "",
      ownerPhone: current.ownerPhone || profile?.phone || user.phoneNumber || "",
      ownerEmail: current.ownerEmail || profile?.email || user.email || ""
    }));
  }, [editingPropertyId, profile, showOwnerTools, user]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
    const pending = bookings.filter((booking) => booking.status === "PENDING_PAYMENT").length;
    const paidAmount = bookings
      .filter((booking) => booking.payment?.status === "PAID")
      .reduce((sum, booking) => sum + booking.tokenAmount, 0);

    return { total: bookings.length, confirmed, pending, paidAmount };
  }, [bookings]);

  function updateOwnerImageFiles(event: ChangeEvent<HTMLInputElement>) {
    setOwnerImages(Array.from(event.target.files ?? []));
  }

  function editOwnerProperty(property: BackendProperty) {
    setEditingPropertyId(property.id);
    setOwnerForm(propertyToOwnerForm(property));
    setOwnerImages([]);
    setOwnerMessage(`Editing ${property.title}. Saving details will send it back to admin approval.`);
    window.location.hash = "owner-listing-form";
  }

  function resetOwnerForm() {
    setEditingPropertyId(null);
    setOwnerForm({
      ...initialOwnerForm,
      ownerName: profile?.name ?? "",
      ownerPhone: profile?.phone ?? user?.phoneNumber ?? "",
      ownerEmail: profile?.email ?? user?.email ?? ""
    });
    setOwnerImages([]);
  }

  async function saveOwnerProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const ownerName = optionalText(ownerForm.ownerName);
    const ownerPhone = optionalText(ownerForm.ownerPhone);
    const ownerEmail = optionalText(ownerForm.ownerEmail);
    const title = ownerForm.title.trim();
    const locality = ownerForm.locality.trim();
    const city = ownerForm.city.trim();

    if (!ownerName) {
      setOwnerMessage("Owner name is required.");
      return;
    }
    if (!ownerPhone || ownerPhone.length < 6) {
      setOwnerMessage("Enter a valid owner contact number.");
      return;
    }
    if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      setOwnerMessage("Enter a valid owner email ID.");
      return;
    }
    if (title.length < 3) {
      setOwnerMessage("Property title must be at least 3 characters.");
      return;
    }
    if (!isPositiveNumber(ownerForm.rentMonthly)) {
      setOwnerMessage(ownerForm.category === "HOMESTAY" ? "Enter a valid daily rate." : "Enter a valid monthly rent.");
      return;
    }
    if (!isPositiveNumber(ownerForm.tokenAmount)) {
      setOwnerMessage("Enter a valid token amount.");
      return;
    }
    if (locality.length < 2) {
      setOwnerMessage("Locality is required.");
      return;
    }
    if (city.length < 2) {
      setOwnerMessage("City is required.");
      return;
    }

    setOwnerSaving(true);
    setOwnerMessage(editingPropertyId ? "Updating owner listing..." : "Submitting owner listing for approval...");

    const typedImages = ownerForm.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .filter(isHttpUrl)
      .map((url, index) => ({ url, sortOrder: index, alt: ownerForm.title }));

    try {
      const payload = {
        ownerName,
        ownerPhone,
        ownerEmail,
        title,
        description: optionalText(ownerForm.description),
        category: ownerForm.category,
        rentMonthly: Number(ownerForm.rentMonthly),
        depositAmount: ownerForm.depositAmount ? Number(ownerForm.depositAmount) : undefined,
        tokenAmount: Number(ownerForm.tokenAmount),
        locality,
        city,
        address: optionalText(ownerForm.address),
        isAvailable: ownerForm.isAvailable,
        amenities: ownerForm.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        images: typedImages
      };

      if (editingPropertyId) {
        const uploadedImages = [];
        if (ownerImages.length && !isCloudinaryUploadConfigured()) {
          setOwnerMessage("Listing details saved. Photo upload needs Cloudinary setup, so selected files were skipped.");
        } else {
          for (const [index, file] of ownerImages.entries()) {
            setOwnerMessage(`Uploading photo ${index + 1} of ${ownerImages.length}...`);
            const url = await uploadPropertyImage(file, editingPropertyId);
            uploadedImages.push({ url, alt: ownerForm.title });
          }
        }

        const images = [...uploadedImages, ...typedImages].map((image, index) => ({ ...image, sortOrder: index }));
        await apiPatch(`/properties/owner/${editingPropertyId}`, { ...payload, images }, { user });
      } else {
        const result = await apiPost<{ property: BackendProperty }>("/properties/owner", payload, { user });

        if (ownerImages.length && !isCloudinaryUploadConfigured()) {
          setOwnerMessage("Listing submitted. Photo upload needs Cloudinary setup, so selected files were skipped.");
        } else {
          for (const [index, file] of ownerImages.entries()) {
            setOwnerMessage(`Uploading photo ${index + 1} of ${ownerImages.length}...`);
            const url = await uploadPropertyImage(file, result.property.id);
            await apiPost(`/properties/owner/${result.property.id}/images`, {
              url,
              alt: result.property.title,
              sortOrder: typedImages.length + index
            }, { user });
          }
        }
      }

      resetOwnerForm();
      setOwnerMessage(ownerImages.length && !isCloudinaryUploadConfigured() ? "Listing saved. Add image URLs or configure Cloudinary for direct photo uploads." : "Listing saved as draft. Admin approval is required before it appears publicly.");
      await loadOwnerProperties();
    } catch (error) {
      setOwnerMessage(error instanceof Error ? error.message : "Unable to save owner listing.");
    } finally {
      setOwnerSaving(false);
    }
  }

  async function toggleAvailability(property: BackendProperty) {
    if (!user) return;
    setOwnerProperties((current) => current.map((item) => (
      item.id === property.id ? { ...item, isAvailable: !item.isAvailable } : item
    )));
    try {
      await apiPatch(`/properties/owner/${property.id}/availability`, { isAvailable: !property.isAvailable }, { user });
      await loadOwnerProperties();
    } catch (error) {
      setOwnerMessage(error instanceof Error ? error.message : "Unable to update availability.");
      await loadOwnerProperties();
    }
  }

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
          <p>Login to view bookings, payment status, and owner listing tools.</p>
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
          <a href="/dashboard?owner=1">Owner Dashboard</a>
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
      </section>

      {showOwnerTools ? (
        <section className="dashboard-card owner-dashboard-card" id="owner-listing-form">
          <div className="dashboard-head">
            <div>
              <p>Property owner dashboard</p>
              <h1>{editingPropertyId ? "Edit Your Property" : "List Your Property"}</h1>
              <span>Owner listings stay in draft until admin approval.</span>
            </div>
            {editingPropertyId ? <button type="button" className="admin-button" onClick={resetOwnerForm}>New Listing</button> : null}
          </div>

          <form className="admin-form owner-property-form" onSubmit={saveOwnerProperty}>
            <input value={ownerForm.ownerName} onChange={(e) => setOwnerForm({ ...ownerForm, ownerName: e.target.value })} placeholder="Owner name" required />
            <input value={ownerForm.ownerPhone} onChange={(e) => setOwnerForm({ ...ownerForm, ownerPhone: e.target.value })} placeholder="Contact number" inputMode="tel" required />
            <input value={ownerForm.ownerEmail} onChange={(e) => setOwnerForm({ ...ownerForm, ownerEmail: e.target.value })} placeholder="Email ID" type="email" required />
            <input value={ownerForm.title} onChange={(e) => setOwnerForm({ ...ownerForm, title: e.target.value })} placeholder="Property title" required />
            <textarea value={ownerForm.description} onChange={(e) => setOwnerForm({ ...ownerForm, description: e.target.value })} placeholder="Short listing description" />
            <select value={ownerForm.category} onChange={(e) => setOwnerForm({ ...ownerForm, category: e.target.value })}>
              <option value="PG">PG</option>
              <option value="GIRLS_PG">Girls PG</option>
              <option value="BOYS_PG">Boys PG</option>
              <option value="ROOM">Room</option>
              <option value="FLAT">Flat</option>
              <option value="HOMESTAY">Homestay</option>
              <option value="HOSTEL">Hostel</option>
            </select>
            <input value={ownerForm.rentMonthly} onChange={(e) => setOwnerForm({ ...ownerForm, rentMonthly: e.target.value })} inputMode="numeric" placeholder={ownerForm.category === "HOMESTAY" ? "Daily rate" : "Monthly rent"} required />
            <input value={ownerForm.depositAmount} onChange={(e) => setOwnerForm({ ...ownerForm, depositAmount: e.target.value })} inputMode="numeric" placeholder="Deposit amount" />
            <input value={ownerForm.tokenAmount} onChange={(e) => setOwnerForm({ ...ownerForm, tokenAmount: e.target.value })} inputMode="numeric" placeholder="Token amount" required />
            <input value={ownerForm.locality} onChange={(e) => setOwnerForm({ ...ownerForm, locality: e.target.value })} placeholder="Locality" required />
            <input value={ownerForm.city} onChange={(e) => setOwnerForm({ ...ownerForm, city: e.target.value })} placeholder="City" required />
            <input value={ownerForm.address} onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })} placeholder="Full address" />
            <input value={ownerForm.amenities} onChange={(e) => setOwnerForm({ ...ownerForm, amenities: e.target.value })} placeholder="Amenities comma separated" />
            <label><input type="checkbox" checked={ownerForm.isAvailable} onChange={(e) => setOwnerForm({ ...ownerForm, isAvailable: e.target.checked })} /> Available now</label>
            <textarea value={ownerForm.imageUrls} onChange={(e) => setOwnerForm({ ...ownerForm, imageUrls: e.target.value })} placeholder="Image URLs, one per line" />
            <label className="admin-file-field">
              <span>Upload property photos</span>
              <input type="file" accept="image/*" multiple onChange={updateOwnerImageFiles} />
            </label>
            {ownerImages.length > 0 ? <p className="admin-form-note">{ownerImages.length} photo{ownerImages.length > 1 ? "s" : ""} selected.</p> : null}
            <p className="admin-form-note">Admin approval is required before public publishing. Editing details sends the listing back to draft review.</p>
            {ownerMessage ? <p className="auth-message">{ownerMessage}</p> : null}
            <button type="submit" disabled={ownerSaving}>{ownerSaving ? "Saving..." : editingPropertyId ? "Save Changes for Approval" : "Submit for Admin Approval"}</button>
          </form>

          <div className="dashboard-section-head">
            <div>
              <span>Owner inventory</span>
              <h2>My Properties</h2>
            </div>
          </div>

          <div className="owner-property-list">
            {ownerProperties.length ? ownerProperties.map((property) => (
              <article key={property.id}>
                {property.images[0]?.url ? <img src={property.images[0].url} alt={property.title} /> : <div className="admin-thumb-placeholder">Photos pending</div>}
                <div>
                  <h3>{property.title}</h3>
                  <p>{property.locality} | {formatMoney(property.rentMonthly)}{priceSuffix(property)} | {property.status}</p>
                  <div className="owner-property-actions">
                    <button type="button" onClick={() => editOwnerProperty(property)}>Edit</button>
                    <button type="button" onClick={() => toggleAvailability(property)}>
                      {property.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    </button>
                    <span>{property.isAvailable ? "Available live" : "Unavailable live"}</span>
                  </div>
                </div>
              </article>
            )) : (
              <div className="dashboard-empty-state">
                <h3>No owner listings yet</h3>
                <p>Submit your first property above. The admin team can review and publish it from the admin panel.</p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="dashboard-card">
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
