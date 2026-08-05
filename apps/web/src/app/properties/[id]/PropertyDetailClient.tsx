"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { BackendProperty } from "@/types/api";

const WHATSAPP_NUMBER = "918133983732";

const categoryLabels: Record<BackendProperty["category"], string> = {
  PG: "PG",
  GIRLS_PG: "Girls PG",
  BOYS_PG: "Boys PG",
  ROOM: "Rooms",
  FLAT: "Flats",
  HOMESTAY: "Homestay",
  HOSTEL: "Hostel"
};

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function billingUnit(property: BackendProperty) {
  return property.category === "HOMESTAY" ? "/day" : "/mo";
}

function propertyUrl(propertyId: string) {
  if (typeof window === "undefined") return `/properties/${propertyId}`;
  return `${window.location.origin}/properties/${propertyId}`;
}

type Props = {
  propertyId: string;
};

export function PropertyDetailClient({ propertyId }: Props) {
  const [property, setProperty] = useState<BackendProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    apiFetch<{ property: BackendProperty }>(`/properties/${encodeURIComponent(propertyId)}`)
      .then((result) => {
        if (!mounted) return;
        setProperty(result.property);
        setError("");
      })
      .catch((apiError: Error) => {
        if (!mounted) return;
        setError(apiError.message || "Property could not be loaded");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const images = useMemo(() => property?.images.map((image) => image.url).filter(Boolean) ?? [], [property]);
  const mainImage = images[0];

  function shareProperty() {
    if (!property) return;
    const url = propertyUrl(property.id);
    const text = `ApnaRooms listing: ${property.title}\n${property.locality} | ${formatMoney(property.rentMonthly)}${billingUnit(property)}\n${url}`;

    if (navigator.share) {
      void navigator.share({ title: property.title, text, url }).catch(() => undefined);
      return;
    }

    void navigator.clipboard?.writeText(text);
  }

  function whatsappMessage() {
    if (!property) return "";
    return encodeURIComponent(
      [
        `Hi ApnaRooms, I want to book/check this property: ${property.title}`,
        `Category: ${categoryLabels[property.category]}`,
        `Location: ${property.locality}, ${property.city}`,
        `Rent: ${formatMoney(property.rentMonthly)}${billingUnit(property)}`,
        `Token: ${formatMoney(property.tokenAmount)}`,
        `Link: ${propertyUrl(property.id)}`
      ].join("\n")
    );
  }

  return (
    <main className="property-detail-page">
      <nav className="property-detail-nav">
        <Link href="/" aria-label="ApnaRooms home">
          <img src="/brand/apnarooms-logo.png" alt="ApnaRooms" />
        </Link>
        <Link className="property-detail-back" href="/properties">
          <i className="bi bi-arrow-left" />
          Listings
        </Link>
      </nav>

      {loading ? (
        <section className="property-detail-state">
          <i className="bi bi-house-door" />
          <p>Loading property...</p>
        </section>
      ) : error || !property ? (
        <section className="property-detail-state">
          <i className="bi bi-exclamation-circle" />
          <h1>Property not available</h1>
          <p>{error || "This listing may be unpublished or already booked."}</p>
          <Link href="/properties">Browse live listings</Link>
        </section>
      ) : (
        <section className="property-detail-shell">
          <div className="property-detail-gallery">
            {mainImage ? (
              <img className="property-detail-main-image" src={mainImage} alt={property.title} />
            ) : (
              <div className="property-detail-placeholder">
                <i className="bi bi-image" />
                <span>Photos coming soon</span>
              </div>
            )}
            {images.length > 1 ? (
              <div className="property-detail-thumbs">
                {images.slice(1, 4).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${property.title} photo ${index + 2}`} />
                ))}
              </div>
            ) : null}
          </div>

          <article className="property-detail-info">
            <div className="property-detail-kicker">
              <span>{categoryLabels[property.category]}</span>
              {property.isVerified ? <span><i className="bi bi-patch-check-fill" /> Verified</span> : null}
              <span>{property.isAvailable ? "Available" : "Reserved"}</span>
            </div>

            <h1>{property.title}</h1>
            <p className="property-detail-location">
              <i className="bi bi-geo-alt-fill" />
              {[property.address, property.locality, property.city].filter(Boolean).join(", ")}
            </p>

            <div className="property-detail-price-row">
              <div>
                <span>{property.category === "HOMESTAY" ? "Daily Rate" : "Monthly Rent"}</span>
                <strong>{formatMoney(property.rentMonthly)}{billingUnit(property)}</strong>
              </div>
              <div>
                <span>Booking Token</span>
                <strong>{formatMoney(property.tokenAmount)}</strong>
              </div>
            </div>

            {property.description ? <p className="property-detail-description">{property.description}</p> : null}

            <div className="property-detail-tags">
              {(property.amenities.length ? property.amenities : [categoryLabels[property.category], "ApnaRooms verified"]).map((amenity) => (
                <span key={amenity}><i className="bi bi-check2-circle" /> {amenity}</span>
              ))}
            </div>

            <div className="property-detail-actions">
              <Link className="property-detail-book" href={`/?checkout=${property.id}`}>
                <i className="bi bi-shield-check" />
                Book Token
              </Link>
              <a className="property-detail-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage()}`} target="_blank" rel="noreferrer">
                <i className="bi bi-whatsapp" />
                WhatsApp
              </a>
              <button type="button" className="property-detail-share" onClick={shareProperty} aria-label="Share property">
                <i className="bi bi-share-fill" />
              </button>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
