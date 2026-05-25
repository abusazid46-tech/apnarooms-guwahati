"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiPost } from "@/lib/api";
import { loadRazorpayCheckout } from "@/lib/razorpay";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBooking, BackendProperty } from "@/types/api";

type PropertyCategory = "PG" | "Homestay" | "Flat" | "Roommate";

type Property = {
  id: string;
  name: string;
  location: string;
  locality: string;
  price: number;
  tokenAmount: number;
  verified: boolean;
  available: boolean;
  category: PropertyCategory;
  details: string[];
  images: string[];
};

type AppliedCoupon = {
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  discountAmount: number;
  finalAmount: number;
};

type PublicCoupon = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  maxDiscount?: number | null;
};

const categories: Array<{ value: "all" | PropertyCategory; label: string; icon: string }> = [
  { value: "all", label: "All Estates", icon: "bi-crown-fill" },
  { value: "PG", label: "PG Luxury", icon: "bi-building" },
  { value: "Homestay", label: "Homestay", icon: "bi-flower1" },
  { value: "Flat", label: "Flats", icon: "bi-door-closed-fill" },
  { value: "Roommate", label: "Rooms for Rent", icon: "bi-door-open-fill" }
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function tokenFor(property: Property) {
  return property.tokenAmount;
}

function normaliseImages(images: string[]) {
  const sourceImages = images.filter(Boolean).slice(0, 3);
  if (!sourceImages.length) return [];
  const normalised = [...sourceImages];
  while (normalised.length < 3) {
    normalised.push(sourceImages[normalised.length % sourceImages.length]);
  }
  return normalised;
}

function mapBackendProperty(property: BackendProperty): Property {
  const categoryMap: Record<BackendProperty["category"], PropertyCategory> = {
    PG: "PG",
    HOMESTAY: "Homestay",
    FLAT: "Flat",
    ROOM: "Roommate"
  };

  return {
    id: property.id,
    name: property.title,
    location: property.address ?? property.locality,
    locality: property.locality,
    price: property.rentMonthly,
    tokenAmount: property.tokenAmount,
    verified: property.isVerified,
    available: property.isAvailable,
    category: categoryMap[property.category],
    details: property.amenities.length ? property.amenities : [property.category, property.isAvailable ? "Available" : "Reserved"],
    images: normaliseImages(property.images.map((image) => image.url))
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState<"all" | PropertyCategory>("all");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [radius, setRadius] = useState(2);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [remoteProperties, setRemoteProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [apiNotice, setApiNotice] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<AppliedCoupon | null>(null);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);
  const [couponStatus, setCouponStatus] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("apnarooms_recent");
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {
      localStorage.removeItem("apnarooms_recent");
    }
  }, []);

  useEffect(() => {
    setLoadingProperties(true);
    apiFetch<{ properties: BackendProperty[] }>("/properties?limit=100")
      .then((result) => {
        setRemoteProperties(result.properties.map(mapBackendProperty));
        setApiNotice(result.properties.length ? `${result.properties.length} live listing${result.properties.length > 1 ? "s" : ""} loaded from backend.` : "No published listings yet. Add a property from the admin panel to enable booking.");
      })
      .catch(() => {
        setRemoteProperties([]);
        setApiNotice("Unable to load live listings. Check backend URL, CORS, and Render deploy status.");
      })
      .finally(() => setLoadingProperties(false));

    apiFetch<{ coupons: PublicCoupon[] }>("/coupons")
      .then((result) => setPublicCoupons(result.coupons))
      .catch(() => setPublicCoupons([]));
  }, []);

  const properties = remoteProperties;
  const locations = useMemo(
    () => Array.from(new Set(properties.map((property) => property.locality))).sort(),
    [properties]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return properties.filter((property) => {
      const matchesCategory = category === "all" || property.category === category;
      const matchesQuery =
        !normalized ||
        property.name.toLowerCase().includes(normalized) ||
        property.location.toLowerCase().includes(normalized) ||
        property.locality.toLowerCase().includes(normalized) ||
        property.price.toString().includes(normalized);
      const matchesLocation = !location || property.locality === location;
      const matchesMin = min === null || property.price >= min;
      const matchesMax = max === null || property.price <= max;
      return matchesCategory && matchesQuery && matchesLocation && matchesMin && matchesMax;
    });
  }, [category, location, maxPrice, minPrice, properties, query]);

  const recentProperties = recentIds
    .map((id) => properties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));

  const token = selectedProperty ? tokenFor(selectedProperty) : 0;
  const total = activeCoupon?.finalAmount ?? token;
  const savings = activeCoupon?.discountAmount ?? 0;

  function openBooking(property: Property) {
    setSelectedProperty(property);
    setActiveCoupon(null);
    setCouponStatus("");
    setCheckoutMessage("");
    setRecentIds((current) => {
      const next = [property.id, ...current.filter((id) => id !== property.id)].slice(0, 5);
      localStorage.setItem("apnarooms_recent", JSON.stringify(next));
      return next;
    });
  }

  async function applyCoupon() {
    if (!selectedProperty) {
      setCouponStatus("Select a property before applying a coupon.");
      return;
    }

    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponStatus("Please enter a code first.");
      return;
    }

    try {
      const result = await apiPost<{
        coupon: { code: string; type: "PERCENT" | "FLAT"; value: number };
        discountAmount: number;
        finalAmount: number;
      }>("/coupons/validate", { code, amount: token });

      setActiveCoupon({
        code: result.coupon.code,
        label: `${formatMoney(result.discountAmount)} discount applied`,
        type: result.coupon.type === "FLAT" ? "flat" : "percent",
        value: result.coupon.value,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount
      });
      setCouponStatus(`${result.coupon.code} applied. You saved ${formatMoney(result.discountAmount)}.`);
    } catch (error) {
      setActiveCoupon(null);
      setCouponStatus(error instanceof Error ? error.message : "Invalid or expired coupon.");
    }
  }

  function shareProperty(property: Property) {
    const origin = window.location.origin;
    const text = `ApnaRooms listing: ${property.name}\n${property.locality} | ${formatMoney(property.price)}/mo\n${origin}/properties/${property.id}`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function bookOnWhatsApp(property: Property) {
    const origin = window.location.origin;
    const text = [
      "Hi ApnaRooms, I want to book this property.",
      `Property: ${property.name}`,
      `Locality: ${property.locality}`,
      `Rent: ${formatMoney(property.price)}/mo`,
      `Token: ${formatMoney(property.tokenAmount)}`,
      `Link: ${origin}/properties/${property.id}`
    ].join("\n");
    const target = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=` : "https://wa.me/?text=";
    window.location.href = `${target}${encodeURIComponent(text)}`;
  }

  async function startCheckout() {
    if (!selectedProperty) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!selectedProperty.available) {
      setCheckoutMessage("This property is currently reserved. Please choose another live listing.");
      return;
    }

    setBookingBusy(true);
    setCheckoutMessage("Creating secure booking...");
    try {
      const bookingResult = await apiPost<{ booking: BackendBooking }>(
        "/bookings",
        { propertyId: selectedProperty.id, couponCode: activeCoupon?.code },
        { user }
      );
      setCheckoutMessage("Opening Razorpay Checkout...");
      const orderResult = await apiPost<{ order: Record<string, string | number> }>(
        "/payments/create-order",
        { bookingId: bookingResult.booking.id },
        { user }
      );

      const loaded = await loadRazorpayCheckout();
      if (!loaded || !window.Razorpay) throw new Error("Unable to load Razorpay Checkout");

      const order = orderResult.order;
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ApnaRooms",
        description: selectedProperty.name,
        order_id: order.id,
        handler: async (response: Record<string, string>) => {
          await apiPost(
            "/payments/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },
            { user }
          );
          setCheckoutMessage("Payment verified. Booking confirmed.");
          setSelectedProperty(null);
          window.location.href = "/dashboard";
        },
        prefill: {
          name: user.displayName ?? "",
          email: user.email ?? "",
          contact: user.phoneNumber ?? ""
        },
        theme: { color: "#f97316" }
      });

      razorpay.open();
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setBookingBusy(false);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setApiNotice("Location permission is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setRadius(2);
        setApiNotice("Location permission granted. Select a live locality to narrow results.");
      },
      () => setApiNotice("Location permission was blocked. You can still filter by locality.")
    );
  }

  return (
    <main className="tenant-site">
      <nav className="navbar-lux">
        <a className="navbar-brand-lux" href="#">
          <i className="bi bi-house-heart-fill" />
          ApnaRooms.com
        </a>
        <button
          type="button"
          className="nav-menu-toggle"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <i className={mobileMenuOpen ? "bi bi-x-lg" : "bi bi-list"} />
        </button>
        <div className={mobileMenuOpen ? "nav-link-wrap open" : "nav-link-wrap"}>
          <a href="#listings" onClick={() => setMobileMenuOpen(false)}>Listings</a>
          <a href="/about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#blog" onClick={() => setMobileMenuOpen(false)}>Blog</a>
          <a href="#coupon" onClick={() => setMobileMenuOpen(false)}>Offers</a>
          <a href="/login" onClick={() => setMobileMenuOpen(false)}>Account</a>
        </div>
      </nav>

      <section className="hero-luxury">
        <div className="hero-inner">
          <div className="text-center kinetic-headline">
            <h1>
              <span>The</span>
              <span>ApnaRooms</span>
              <span>Atelier</span>
              <span>Zero</span>
              <span>Brokerage,</span>
              <span>Infinite</span>
              <span>Luxury.</span>
            </h1>
            <p>Verified PG, Rooms, Flats and Homestays in Guwahati. 0% Brokerage, 100% Trusted.</p>
          </div>

          <div className="search-lux-shell">
            <div className="search-gold-group">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by locality, property, or budget..."
              />
              <button type="button" onClick={() => setQuery(query.trim())}>
                <i className="bi bi-search-heart" />
                Search
              </button>
            </div>

            <div className="hero-filter-row">
              <div className="location-tools">
                <select value={location} onChange={(event) => setLocation(event.target.value)}>
                  <option value="">Prime Locations</option>
                  {locations.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <button type="button" onClick={detectLocation}>
                  <i className="bi bi-crosshair2" />
                  My Location
                </button>
              </div>

              <div className="price-filter-pill">
                <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" placeholder="Min INR" />
                <span>-</span>
                <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" placeholder="Max INR" />
                <button type="button">Apply</button>
              </div>
            </div>

            {location ? (
              <div className="radius-slider-wrap">
                <span><i className="bi bi-broadcast" /> Radius:</span>
                <input type="range" min="0.5" max="10" step="0.5" value={radius} onChange={(event) => setRadius(Number(event.target.value))} />
                <strong>{radius} km</strong>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="tenant-container" id="listings">
        <div className="category-scroll">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              className={category === item.value ? "category-lux active" : "category-lux"}
              onClick={() => setCategory(item.value)}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="listing-meta">
          <div>
            <span>Live luxury inventory</span>
            <h2>Verified rooms ready for secure token booking</h2>
            {apiNotice ? <p className="api-notice">{apiNotice}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("");
              setCategory("all");
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Clear filters
          </button>
        </div>

        {loadingProperties ? (
          <div className="no-results-lux">
            <i className="bi bi-hourglass-split" />
            <p>Loading live properties from backend...</p>
          </div>
        ) : filtered.length ? (
          <div className="property-grid-lux">
            {filtered.map((property) => (
              <article className="property-card-lux" key={property.id}>
                <div className="img-zoom-wrapper">
                  {property.images.length ? (
                    <>
                      <div className="card-slider" aria-label={`${property.name} image gallery`}>
                        {property.images.map((image, index) => (
                          <img key={`${image}-${index}`} src={image} alt={`${property.name} view ${index + 1}`} />
                        ))}
                      </div>
                      <div className="carousel-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </>
                  ) : (
                    <div className="listing-image-placeholder">
                      <i className="bi bi-image" />
                      <span>Photos pending</span>
                    </div>
                  )}
                  {property.available ? (
                    property.verified ? <span className="verified-lux-badge">Certified Gold</span> : <span className="review-badge">Reviewing</span>
                  ) : <span className="review-badge">Reserved</span>}
                </div>
                <div className="property-body">
                  <h3>{property.name}</h3>
                  <p>
                    <i className="bi bi-geo-alt-fill" />
                    {property.location}
                    <span>{property.category}</span>
                  </p>
                  <div className="prop-details-row">
                    {property.details.map((detail) => (
                      <span className="prop-detail-tag" key={detail}>{detail}</span>
                    ))}
                  </div>
                  <div className="card-action-row">
                    <strong>{formatMoney(property.price)}<small>/mo</small></strong>
                    <div>
                      <button type="button" className="btn-share-card" onClick={() => shareProperty(property)}>
                        <i className="bi bi-share-fill" />
                      </button>
                      <button type="button" className="btn-whatsapp-book" disabled={!property.available} onClick={() => bookOnWhatsApp(property)}>
                        <i className="bi bi-whatsapp" />
                        WhatsApp
                      </button>
                      <button type="button" className="btn-book-lux" disabled={!property.available} onClick={() => openBooking(property)}>
                        {property.available ? "Secure Book" : "Reserved"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results-lux">
            <i className="bi bi-house-add" />
            <p>{properties.length ? "No properties found. Try a different filter or location." : "No live properties yet. Add a published property from the admin panel to enable booking."}</p>
          </div>
        )}
      </section>

      <section className="tenant-container recent-section-lux">
        <div className="section-title-row">
          <i className="bi bi-clock-history" />
          <h2>Recently Viewed</h2>
        </div>
        <div className="recent-grid-lux">
          {recentProperties.length ? recentProperties.map((property) => (
            <button type="button" key={property.id} onClick={() => openBooking(property)}>
              {property.images[0] ? <img src={property.images[0]} alt="" /> : <span className="recent-placeholder">Photos pending</span>}
              <span>{property.name}</span>
              <small>{property.locality}</small>
            </button>
          )) : <p>No estates viewed recently.</p>}
        </div>
      </section>

      <section className="tenant-container about-section" id="about">
        <div className="about-copy">
          <span className="blog-tag">About Us</span>
          <h2>Guwahati&apos;s Most Trusted Zero-Brokerage Platform</h2>
          <p>
            ApnaRooms connects tenants directly with verified landlords. No middlemen,
            no hidden fees, and no stress.
          </p>
          <p>
            Students, working professionals, and families can browse curated rooms,
            compare pricing, apply offers, and book with a secure token flow.
          </p>
          <div className="about-badges">
            <span>AI Verified</span>
            <span>0% Brokerage</span>
            <span>24/7 Support</span>
          </div>
        </div>
        <div className="about-stats-grid">
          <div><strong>500+</strong><span>Property Listings</span></div>
          <div><strong>98%</strong><span>Happy Tenants</span></div>
          <div><strong>0%</strong><span>Brokerage Fee</span></div>
          <div><strong>12+</strong><span>Prime Localities</span></div>
        </div>
      </section>

      <section className="tenant-container coupon-section" id="coupon">
        <div>
          <h2>Active Booking Offers</h2>
          <p>Choose a live property first, then apply one of these backend-validated coupons during checkout.</p>
          <div className="coupon-pill-list">
            {publicCoupons.length ? publicCoupons.map((coupon) => (
              <button type="button" key={coupon.code} onClick={() => setCouponInput(coupon.code)}>
                <strong>{coupon.code}</strong>
                <span>{coupon.type === "FLAT" ? formatMoney(coupon.value) : `${coupon.value}%`} off</span>
              </button>
            )) : <span>No active coupons right now.</span>}
          </div>
        </div>
        <div className="referral-box">
          <h3>Refer and Earn</h3>
          <p>Share APNA-USER-1234 with friends. When they book, both users save.</p>
          <button type="button" onClick={() => navigator.clipboard?.writeText("APNA-USER-1234")}>Copy Referral Code</button>
        </div>
      </section>

      <section className="tenant-container blog-section" id="blog">
        <div className="listing-meta">
          <div>
            <span>Our Blog</span>
            <h2>Insights and Housing Tips</h2>
          </div>
        </div>
        <div className="blog-grid-lux">
          {[
            ["Tenant Tips", "5 Things to Check Before Renting a PG in Guwahati", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"],
            ["Market Trends", "Rental Prices in Guwahati: Area-by-Area Breakdown", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"],
            ["Legal Guide", "Rental Agreement in Assam: What You Must Know", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80"]
          ].map(([tag, title, image]) => (
            <article className="blog-card-lux" key={title}>
              <img src={image} alt={title} />
              <div>
                <span>{tag}</span>
                <h3>{title}</h3>
                <p>Short, practical guidance for renters before they schedule a visit or book a token.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer-lux">
        <div className="tenant-container footer-grid">
          <div>
            <h3>ApnaRooms</h3>
            <p>Zero-brokerage rental platform with verified homes in Guwahati.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#listings">Property Listings</a>
            <a href="/about">About Us</a>
            <a href="#blog">Blog</a>
            <a href="#coupon">Offers</a>
          </div>
          <div>
            <h4>Support</h4>
            <p>hello@apnarooms.com</p>
            <p>GS Road, Guwahati 781005</p>
          </div>
        </div>
      </footer>

      {selectedProperty ? (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <div className="booking-modal-lux">
            <div className="modal-purple-header">
              <h2>Secure Token Booking</h2>
              <button type="button" onClick={() => setSelectedProperty(null)}>Close</button>
            </div>
            <div className="modal-body-lux">
              <h3>{selectedProperty.name}</h3>
              <div className="booking-summary">
                <div><span>Monthly Rent</span><strong>{formatMoney(selectedProperty.price)}</strong></div>
                <div><span>Token Fee</span><strong>{formatMoney(token)}</strong></div>
                {savings > 0 ? <div className="success-row"><span>{activeCoupon?.code}</span><strong>-{formatMoney(savings)}</strong></div> : null}
                <div className="total-row"><span>Total Payable</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <div className="coupon-input-wrap modal-coupon-row">
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder={publicCoupons[0]?.code ?? "Enter active coupon code"} />
                <button type="button" onClick={applyCoupon}>Apply</button>
              </div>
              {couponStatus ? <p className="coupon-result modal-status">{couponStatus}</p> : null}
              {checkoutMessage ? <p className="checkout-status">{checkoutMessage}</p> : null}
              <button
                type="button"
                className="pay-cta-lux"
                disabled={bookingBusy}
                onClick={startCheckout}
              >
                {bookingBusy ? "Preparing checkout..." : "Continue to Razorpay Checkout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
