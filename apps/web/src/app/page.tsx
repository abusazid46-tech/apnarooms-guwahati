"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiPost } from "@/lib/api";
import { loadRazorpayCheckout } from "@/lib/razorpay";
import { useAuth } from "@/hooks/useAuth";
import type { BackendBlogPost, BackendBooking, BackendProperty, BackendReview } from "@/types/api";

type PropertyCategory = BackendProperty["category"];

type Property = {
  id: string;
  name: string;
  description: string;
  location: string;
  locality: string;
  price: number;
  tokenAmount: number;
  verified: boolean;
  available: boolean;
  category: PropertyCategory;
  billingUnit: "month" | "day";
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
  expiresAt?: string | null;
};

type PublicBlogCard = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
};

type CategoryTile = {
  key: string;
  value: "all" | PropertyCategory;
  label: string;
  icon: string;
};

const categories: CategoryTile[] = [
  { key: "all", value: "all", label: "All", icon: "bi-grid" },
  { key: "pg", value: "PG", label: "PG", icon: "bi-building" },
  { key: "girls-pg", value: "GIRLS_PG", label: "Girls PG", icon: "bi-person-hearts" },
  { key: "boys-pg", value: "BOYS_PG", label: "Boys PG", icon: "bi-person-check" },
  { key: "room", value: "ROOM", label: "Rooms", icon: "bi-door-open" },
  { key: "flat", value: "FLAT", label: "Flats", icon: "bi-houses" },
  { key: "homestay", value: "HOMESTAY", label: "Homestay", icon: "bi-house-heart" },
  { key: "hostel", value: "HOSTEL", label: "Hostel", icon: "bi-buildings" }
];

const categoryLabels: Record<PropertyCategory, string> = {
  PG: "PG",
  GIRLS_PG: "Girls PG",
  BOYS_PG: "Boys PG",
  ROOM: "Rooms",
  FLAT: "Flats",
  HOMESTAY: "Homestay",
  HOSTEL: "Hostel"
};

const categorySearchTerms: Record<PropertyCategory, string[]> = {
  PG: ["pg", "paying guest"],
  GIRLS_PG: ["girls pg", "girl pg", "female pg", "women pg", "ladies pg", "girls hostel"],
  BOYS_PG: ["boys pg", "boy pg", "male pg", "men pg", "gents pg", "boys hostel"],
  ROOM: ["room", "rooms", "rental room", "single room"],
  FLAT: ["flat", "flats", "apartment", "apartments"],
  HOMESTAY: ["homestay", "home stay", "daily stay"],
  HOSTEL: ["hostel", "hostels"]
};

const fallbackBlogPosts: PublicBlogCard[] = [
  {
    id: "tenant-tips",
    category: "Tenant Tips",
    title: "5 Things to Check Before Renting a PG in Guwahati",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    excerpt: "Short, practical guidance for renters before they schedule a visit or book a token."
  },
  {
    id: "market-trends",
    category: "Market Trends",
    title: "Rental Prices in Guwahati: Area-by-Area Breakdown",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    excerpt: "Short, practical guidance for renters before they schedule a visit or book a token."
  },
  {
    id: "legal-guide",
    category: "Legal Guide",
    title: "Rental Agreement in Assam: What You Must Know",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    excerpt: "Short, practical guidance for renters before they schedule a visit or book a token."
  }
];

const defaultLocalities = ["Beltola", "Ganeshguri", "Six Mile", "GS Road", "Panjabari", "Kahilipara"];

const initialListingForm = {
  ownerName: "",
  phone: "",
  propertyType: "PG",
  propertyName: "",
  locality: "",
  city: "Guwahati",
  address: "",
  rent: "",
  deposit: "",
  availableFrom: "",
  rooms: "",
  amenities: "",
  description: ""
};

const initialReviewForm = {
  name: "",
  phone: "",
  email: "",
  rating: "5",
  propertyId: "",
  body: ""
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const WHATSAPP_NUMBER = "918133983732";

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function formatCouponOffer(coupon: PublicCoupon) {
  if (coupon.type === "FLAT") return `${formatMoney(coupon.value)} off`;
  return `${coupon.value}% off${coupon.maxDiscount ? ` up to ${formatMoney(coupon.maxDiscount)}` : ""}`;
}

function formatCouponExpiry(value?: string | null) {
  if (!value) return "No expiry";
  return `Valid till ${new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  })}`;
}

function tokenFor(property: Property) {
  return property.tokenAmount;
}

function pricePeriod(property: Pick<Property, "billingUnit">) {
  return property.billingUnit === "day" ? "/day" : "/mo";
}

function priceLine(property: Pick<Property, "price" | "billingUnit">) {
  return `${formatMoney(property.price)}${pricePeriod(property)}`;
}

function rateLabel(property: Pick<Property, "billingUnit">) {
  return property.billingUnit === "day" ? "Daily Rate" : "Monthly Rent";
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
  return {
    id: property.id,
    name: property.title,
    description: property.description ?? "",
    location: property.address ?? property.locality,
    locality: property.locality,
    price: property.rentMonthly,
    tokenAmount: property.tokenAmount,
    verified: property.isVerified,
    available: property.isAvailable,
    category: property.category,
    billingUnit: property.category === "HOMESTAY" ? "day" : "month",
    details: property.amenities.length ? property.amenities : [categoryLabels[property.category], property.isAvailable ? "Available" : "Reserved"],
    images: normaliseImages(property.images.map((image) => image.url))
  };
}

function mapBlogPost(post: BackendBlogPost): PublicBlogCard {
  return {
    id: post.id,
    title: post.title,
    category: post.category || "ApnaRooms Blog",
    excerpt: post.excerpt || post.body.slice(0, 140),
    image: post.coverImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
  };
}

function propertySearchText(property: Pick<Property, "name" | "description" | "location" | "locality" | "category" | "details">) {
  return [
    property.name,
    property.description,
    property.location,
    property.locality,
    categoryLabels[property.category],
    ...categorySearchTerms[property.category],
    ...property.details
  ].join(" ").toLowerCase();
}

function queryMatchesText(searchText: string, normalizedQuery: string) {
  if (!normalizedQuery) return true;
  if (searchText.includes(normalizedQuery)) return true;

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return words.length > 1 && words.every((word) => searchText.includes(word));
}

function matchesCategoryFilter(property: Property, selectedCategory: "all" | PropertyCategory) {
  if (selectedCategory === "all") return true;
  if (selectedCategory === "PG") return ["PG", "GIRLS_PG", "BOYS_PG"].includes(property.category);
  if (property.category === selectedCategory) return true;

  const text = propertySearchText(property);
  if (selectedCategory === "GIRLS_PG") return property.category === "PG" && /\b(girl|girls|female|women|ladies)\b/.test(text);
  if (selectedCategory === "BOYS_PG") return property.category === "PG" && /\b(boy|boys|male|men|gents)\b/.test(text);
  if (selectedCategory === "HOSTEL") return /\bhostel\b/.test(text);
  if (selectedCategory === "ROOM") return /\b(room|rooms|rental room)\b/.test(text);
  return false;
}

function PropertyImageCarousel({ property }: { property: Property }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const imageCount = property.images.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [property.id, imageCount]);

  useEffect(() => {
    if (!engaged || imageCount <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % imageCount);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [engaged, imageCount]);

  function moveImage(direction: 1 | -1) {
    if (imageCount <= 1) return;
    setActiveIndex((current) => (current + direction + imageCount) % imageCount);
  }

  return (
    <div
      className="img-zoom-wrapper"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      {imageCount ? (
        <>
          <div
            className="card-slider"
            aria-label={`${property.name} image gallery`}
            style={{ transform: `translateX(-${activeIndex * 33.3333}%)` }}
          >
            {property.images.map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${property.name} view ${index + 1}`} />
            ))}
          </div>
          {imageCount > 1 ? (
            <>
              <button
                type="button"
                className="carousel-arrow carousel-arrow-left"
                aria-label={`Show previous photo of ${property.name}`}
                onClick={() => moveImage(-1)}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <button
                type="button"
                className="carousel-arrow carousel-arrow-right"
                aria-label={`Show next photo of ${property.name}`}
                onClick={() => moveImage(1)}
              >
                <i className="bi bi-chevron-right" />
              </button>
              <div className="carousel-dots" aria-label={`${property.name} photo selector`}>
                {property.images.map((image, index) => (
                  <button
                    key={`${image}-dot-${index}`}
                    type="button"
                    className={activeIndex === index ? "active" : ""}
                    aria-label={`Show photo ${index + 1} of ${property.name}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </>
          ) : null}
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
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [listingForm, setListingForm] = useState(initialListingForm);
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
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [blogPosts, setBlogPosts] = useState<PublicBlogCard[]>(fallbackBlogPosts);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

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

    apiFetch<{ reviews: BackendReview[] }>("/reviews?limit=12")
      .then((result) => setReviews(result.reviews))
      .catch(() => setReviews([]));

    apiFetch<{ posts: BackendBlogPost[] }>("/blog?limit=6")
      .then((result) => setBlogPosts(result.posts.length ? result.posts.map(mapBlogPost) : fallbackBlogPosts))
      .catch(() => setBlogPosts(fallbackBlogPosts));
  }, []);

  useEffect(() => {
    if (loadingProperties || !remoteProperties.length) return;

    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get("checkout") ?? localStorage.getItem("apnarooms_pending_checkout");
    if (!checkoutId) return;

    const property = remoteProperties.find((item) => item.id === checkoutId);
    if (!property) return;

    setSelectedProperty(property);
    localStorage.removeItem("apnarooms_pending_checkout");
    window.history.replaceState(null, "", window.location.pathname);
  }, [loadingProperties, remoteProperties]);

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
      const matchesCategory = matchesCategoryFilter(property, category);
      const searchText = propertySearchText(property);
      const matchesQuery =
        !normalized ||
        queryMatchesText(searchText, normalized) ||
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
  const heroPreviewProperty = properties.find((property) => property.images[0]) ?? properties[0];
  const popularLocalities = (locations.length ? locations : defaultLocalities).slice(0, 6);

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

  async function applyCoupon(codeOverride?: string) {
    if (!selectedProperty) {
      setCouponStatus("Select a property before applying a coupon.");
      return;
    }

    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!code) {
      setCouponStatus("Please enter a code first.");
      return;
    }
    setCouponInput(code);
    setCouponStatus("Checking offer...");

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

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    setReviewMessage("");

    if (!reviewForm.name.trim() || !reviewForm.body.trim()) {
      setReviewMessage("Please add your name and review before submitting.");
      return;
    }

    setReviewSubmitting(true);
    try {
      await apiPost("/reviews", {
        name: reviewForm.name.trim(),
        phone: reviewForm.phone.trim() || undefined,
        email: reviewForm.email.trim() || undefined,
        rating: Number(reviewForm.rating),
        body: reviewForm.body.trim(),
        propertyId: reviewForm.propertyId || undefined,
        source: "website"
      });
      setReviewForm(initialReviewForm);
      setReviewMessage("Thank you. Your review is saved and will appear after admin approval.");
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : "Could not submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  function selectOffer(coupon: PublicCoupon) {
    setCouponInput(coupon.code);
    setCouponStatus(selectedProperty ? `${coupon.code} selected. Tap Apply to validate it for this booking.` : `${coupon.code} copied to checkout. Choose a property, then apply it.`);
  }

  function shareProperty(property: Property) {
    const origin = window.location.origin;
    const text = `ApnaRooms listing: ${property.name}\n${property.locality} | ${priceLine(property)}\n${origin}/properties/${property.id}`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function bookOnWhatsApp(property: Property) {
    const origin = window.location.origin;
    const text = [
      "Hi ApnaRooms, I want to book this property.",
      `Property: ${property.name}`,
      `Locality: ${property.locality}`,
      `${rateLabel(property)}: ${priceLine(property)}`,
      `Token: ${formatMoney(property.tokenAmount)}`,
      `Link: ${origin}/properties/${property.id}`
    ].join("\n");
    const target = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=` : "https://wa.me/?text=";
    window.location.href = `${target}${encodeURIComponent(text)}`;
  }

  function buildListingMessage() {
    return [
      "Hi ApnaRooms, I want to list my property.",
      `Owner name: ${listingForm.ownerName}`,
      `Phone: ${listingForm.phone}`,
      `Property type: ${listingForm.propertyType}`,
      `Property name: ${listingForm.propertyName}`,
      `Locality: ${listingForm.locality}`,
      `City: ${listingForm.city}`,
      `Address: ${listingForm.address}`,
      `Monthly rent: ${listingForm.rent}`,
      `Deposit: ${listingForm.deposit || "Not specified"}`,
      `Available from: ${listingForm.availableFrom || "Not specified"}`,
      `Rooms/beds: ${listingForm.rooms || "Not specified"}`,
      `Amenities: ${listingForm.amenities || "Not specified"}`,
      `Description: ${listingForm.description || "Not specified"}`,
      "Photos: I will upload/send property photos manually in this WhatsApp chat."
    ].join("\n");
  }

  async function submitListingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = buildListingMessage();
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  async function startCheckout() {
    if (!selectedProperty) return;
    if (!user) {
      const nextPath = `/?checkout=${selectedProperty.id}`;
      localStorage.setItem("apnarooms_pending_checkout", selectedProperty.id);
      window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
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
        theme: { color: "#e50914" }
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

  function openOwnerDashboard() {
    const nextPath = "/dashboard?owner=1";
    window.location.href = user ? nextPath : `/login?next=${encodeURIComponent(nextPath)}`;
  }

  function selectCategory(item: CategoryTile) {
    setCategory(item.value);
    setQuery("");
    setLocation("");
  }

  function selectLocality(item: string) {
    setLocation(item);
    window.location.hash = "listings";
  }

  return (
    <main className="tenant-site">
      <nav className="navbar-lux">
        <a className="navbar-brand-lux" href="#">
          <img src="/brand/apnarooms-logo.png" alt="ApnaRooms.com" />
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
          <button
            type="button"
            className="nav-list-button"
            onClick={() => {
              setMobileMenuOpen(false);
              openOwnerDashboard();
            }}
          >
            List Property
          </button>
          <a href="/login" onClick={() => setMobileMenuOpen(false)}>Account</a>
        </div>
      </nav>

      <section className="hero-luxury">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="app-welcome-row">
              <div className="app-avatar">
                <i className="bi bi-person-fill" />
              </div>
              <div>
                <span className="hero-kicker">Welcome to ApnaRooms</span>
                <p>{user?.displayName ? `Hi ${user.displayName.split(" ")[0]}, find your next stay.` : "Premium stays across Guwahati."}</p>
              </div>
            </div>
            <h1>Find Your Rooms Anytime - Anywhere</h1>
            <div className="hero-actions">
              <a href="#listings" className="hero-primary-action">
                <i className="bi bi-search" />
                Explore Listings
              </a>
              <button type="button" className="hero-secondary-action" onClick={openOwnerDashboard}>
                <i className="bi bi-house-add" />
                List Your Property
              </button>
            </div>
            <div className="hero-trust-row">
              <span><i className="bi bi-patch-check-fill" /> Verified listings</span>
              <span><i className="bi bi-whatsapp" /> WhatsApp support</span>
              <span><i className="bi bi-shield-check" /> Secure token booking</span>
            </div>
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

          <div className="hero-preview-card">
            {heroPreviewProperty?.images[0] ? (
              <img src={heroPreviewProperty.images[0]} alt={heroPreviewProperty.name} />
            ) : (
              <div className="hero-preview-placeholder">
                <i className="bi bi-house-heart" />
              </div>
            )}
            <div>
              <span>Featured stay</span>
              <strong>{heroPreviewProperty?.name ?? "Live verified properties"}</strong>
              <small>{heroPreviewProperty ? `${heroPreviewProperty.locality} - ${priceLine(heroPreviewProperty)}` : "Add properties from admin to show live previews"}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="tenant-container app-category-section">
        <div className="app-section-head">
          <div>
            <span>Category</span>
            <h2>Choose your stay type</h2>
          </div>
          <button type="button" onClick={() => {
            setCategory("all");
            setQuery("");
          }} aria-label="See all categories">
            <i className="bi bi-list" />
          </button>
        </div>
        <div className="category-scroll">
          {categories.map((item) => (
            <button
              key={item.key}
              type="button"
              className={category === item.value && !query ? "category-lux active" : "category-lux"}
              onClick={() => selectCategory(item)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="tenant-container popular-locality-section">
        <div className="app-section-head">
          <div>
            <span>Popular Localities</span>
            <h2>Explore near your preferred area</h2>
          </div>
          <button type="button" onClick={detectLocation} aria-label="Use my location">
            <i className="bi bi-crosshair2" />
          </button>
        </div>
        <div className="locality-grid">
          {popularLocalities.map((item, index) => (
            <button type="button" key={item} onClick={() => selectLocality(item)}>
              <span>{item}</span>
              <small>{index < 3 ? "Popular" : "Nearby"}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="tenant-container app-owner-strip" id="list-property">
        <div>
          <span>For property owners</span>
          <h2>List your PG, room or homestay</h2>
          <p>Register as owner, add property details, and publish after admin approval.</p>
        </div>
        <button type="button" onClick={openOwnerDashboard}>
          <i className="bi bi-plus-circle-fill" />
          List Property
        </button>
      </section>

      <section className="tenant-container" id="listings">

        <div className="listing-meta">
          <div>
            <span>Recommended</span>
            <h2>Verified stays ready for booking</h2>
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
                <PropertyImageCarousel property={property} />
                <div className="property-body">
                  <h3>{property.name}</h3>
                  <p>
                    <i className="bi bi-geo-alt-fill" />
                    {property.location}
                    <span>{categoryLabels[property.category]}</span>
                  </p>
                  <div className="prop-details-row">
                    {property.details.map((detail) => (
                      <span className="prop-detail-tag" key={detail}>{detail}</span>
                    ))}
                  </div>
                  <div className="card-action-row">
                    <strong>{formatMoney(property.price)}<small>{pricePeriod(property)}</small></strong>
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

      <section className="tenant-container review-section" id="reviews">
        <div className="listing-meta">
          <div>
            <span>Customer Reviews</span>
            <h2>Real reviews from tenants and visitors</h2>
            <p className="api-notice">Approved customer feedback submitted from the website and tenant app.</p>
          </div>
        </div>
        <div className="review-layout">
          <div className="review-grid">
            {reviews.length ? reviews.map((review) => (
              <article className="client-review-card" key={review.id}>
                <div className="review-stars" aria-label={`${review.rating} star review`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <i key={index} className={`bi ${index < review.rating ? "bi-star-fill" : "bi-star"}`} />
                  ))}
                </div>
                <p>&quot;{review.body}&quot;</p>
                <div className="review-client-row">
                  <span>{review.name.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{review.name}</strong>
                    <small>{review.property ? `${review.property.title} - ${review.property.locality}` : "ApnaRooms customer"}</small>
                  </div>
                </div>
              </article>
            )) : (
              <article className="client-review-card">
                <div className="review-stars" aria-label="No approved reviews yet">
                  {Array.from({ length: 5 }).map((_, index) => <i key={index} className="bi bi-star" />)}
                </div>
                <p>Customer reviews will appear here after admin approval.</p>
                <div className="review-client-row">
                  <span>AR</span>
                  <div>
                    <strong>ApnaRooms</strong>
                    <small>Awaiting approved reviews</small>
                  </div>
                </div>
              </article>
            )}
          </div>
          <form className="review-submit-card" onSubmit={submitReview}>
            <span>Share your experience</span>
            <h3>Submit a customer review</h3>
            <div className="review-form-grid">
              <input value={reviewForm.name} onChange={(event) => setReviewForm({ ...reviewForm, name: event.target.value })} placeholder="Your name" required />
              <select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })} aria-label="Rating">
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
              <input value={reviewForm.phone} onChange={(event) => setReviewForm({ ...reviewForm, phone: event.target.value })} placeholder="Phone optional" />
              <input value={reviewForm.email} onChange={(event) => setReviewForm({ ...reviewForm, email: event.target.value })} placeholder="Email optional" type="email" />
            </div>
            <select value={reviewForm.propertyId} onChange={(event) => setReviewForm({ ...reviewForm, propertyId: event.target.value })}>
              <option value="">General ApnaRooms review</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.name} - {property.locality}</option>)}
            </select>
            <textarea value={reviewForm.body} onChange={(event) => setReviewForm({ ...reviewForm, body: event.target.value })} placeholder="Write your actual stay, visit, booking, or support experience" required />
            {reviewMessage ? <p className="review-form-message">{reviewMessage}</p> : null}
            <button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit Review"}</button>
          </form>
        </div>
      </section>

      <section className="tenant-container coupon-section" id="coupon">
        <div>
          <h2>Active Booking Offers</h2>
          <p>Choose a live property first, then apply one of these backend-validated coupons during checkout.</p>
          <div className="coupon-pill-list">
            {publicCoupons.length ? publicCoupons.map((coupon) => (
              <button type="button" key={coupon.code} onClick={() => selectOffer(coupon)}>
                <strong>{coupon.code}</strong>
                <span>{formatCouponOffer(coupon)}</span>
                <small>{formatCouponExpiry(coupon.expiresAt)}</small>
              </button>
            )) : <span>No active coupons right now.</span>}
          </div>
          {couponStatus ? <p className="coupon-result">{couponStatus}</p> : null}
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
          {blogPosts.map((post) => (
            <article className="blog-card-lux" key={post.id}>
              <img src={post.image} alt={post.title} />
              <div>
                <span>{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
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
            <a href="#reviews">Reviews</a>
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

      <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
        <a href="#">
          <i className="bi bi-house-fill" />
          <span>Home</span>
        </a>
        <a href="#listings">
          <i className="bi bi-compass" />
          <span>Explore</span>
        </a>
        <button type="button" className="mobile-list-action" onClick={openOwnerDashboard}>
          <i className="bi bi-plus-lg" />
          <span>List</span>
        </button>
        <a href="#listings">
          <i className="bi bi-search" />
          <span>Search</span>
        </a>
        <a href="/dashboard">
          <i className="bi bi-person-circle" />
          <span>Profile</span>
        </a>
      </nav>

      {listingFormOpen ? (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <div className="listing-modal-lux">
            <div className="modal-purple-header">
              <h2>List Your Property</h2>
              <button type="button" onClick={() => setListingFormOpen(false)}>Close</button>
            </div>
            <form className="listing-owner-form" onSubmit={submitListingRequest}>
              <div className="form-grid-two">
                <input value={listingForm.ownerName} onChange={(event) => setListingForm({ ...listingForm, ownerName: event.target.value })} placeholder="Owner name" required />
                <input value={listingForm.phone} onChange={(event) => setListingForm({ ...listingForm, phone: event.target.value })} placeholder="Phone / WhatsApp number" required />
                <select value={listingForm.propertyType} onChange={(event) => setListingForm({ ...listingForm, propertyType: event.target.value })}>
                  <option value="PG">PG</option>
                  <option value="Girls PG">Girls PG</option>
                  <option value="Boys PG">Boys PG</option>
                  <option value="Rental Room">Rooms</option>
                  <option value="Flat">Flats</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Guest House">Guest House</option>
                </select>
                <input value={listingForm.propertyName} onChange={(event) => setListingForm({ ...listingForm, propertyName: event.target.value })} placeholder="Property name" required />
                <input value={listingForm.locality} onChange={(event) => setListingForm({ ...listingForm, locality: event.target.value })} placeholder="Locality" required />
                <input value={listingForm.city} onChange={(event) => setListingForm({ ...listingForm, city: event.target.value })} placeholder="City" required />
                <input value={listingForm.address} onChange={(event) => setListingForm({ ...listingForm, address: event.target.value })} placeholder="Full address" required />
                <input value={listingForm.rent} onChange={(event) => setListingForm({ ...listingForm, rent: event.target.value })} inputMode="numeric" placeholder="Monthly rent" required />
                <input value={listingForm.deposit} onChange={(event) => setListingForm({ ...listingForm, deposit: event.target.value })} inputMode="numeric" placeholder="Deposit amount" />
                <input value={listingForm.availableFrom} onChange={(event) => setListingForm({ ...listingForm, availableFrom: event.target.value })} placeholder="Available from" />
                <input value={listingForm.rooms} onChange={(event) => setListingForm({ ...listingForm, rooms: event.target.value })} placeholder="Rooms / beds / occupancy" />
                <input value={listingForm.amenities} onChange={(event) => setListingForm({ ...listingForm, amenities: event.target.value })} placeholder="Amenities, comma separated" />
              </div>
              <textarea value={listingForm.description} onChange={(event) => setListingForm({ ...listingForm, description: event.target.value })} placeholder="Property description, rules, nearby landmarks" />
              <div className="owner-photo-note">
                <strong>Property photos</strong>
                <p>After WhatsApp opens, please upload room, front view, bathroom, kitchen, and nearby landmark photos manually in the chat.</p>
              </div>
              <button type="submit" className="pay-cta-lux">
                <i className="bi bi-whatsapp" />
                Send Listing Request on WhatsApp
              </button>
            </form>
          </div>
        </div>
      ) : null}

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
                <div><span>{rateLabel(selectedProperty)}</span><strong>{priceLine(selectedProperty)}</strong></div>
                <div><span>Token Fee</span><strong>{formatMoney(token)}</strong></div>
                {savings > 0 ? <div className="success-row"><span>{activeCoupon?.code}</span><strong>-{formatMoney(savings)}</strong></div> : null}
                <div className="total-row"><span>Total Payable</span><strong>{formatMoney(total)}</strong></div>
              </div>
              <div className="coupon-input-wrap modal-coupon-row">
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder={publicCoupons[0]?.code ?? "Enter active coupon code"} />
                <button type="button" onClick={() => applyCoupon()}>Apply</button>
              </div>
              {publicCoupons.length ? (
                <div className="modal-offer-picks">
                  {publicCoupons.slice(0, 4).map((coupon) => (
                    <button type="button" key={coupon.code} onClick={() => applyCoupon(coupon.code)}>
                      <strong>{coupon.code}</strong>
                      <span>{formatCouponOffer(coupon)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
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
