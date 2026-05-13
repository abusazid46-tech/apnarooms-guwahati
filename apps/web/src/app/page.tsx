"use client";

import { useEffect, useMemo, useState } from "react";

type PropertyCategory = "PG" | "Homestay" | "Flat" | "Roommate";

type Property = {
  id: number;
  name: string;
  location: string;
  locality: string;
  price: number;
  verified: boolean;
  category: PropertyCategory;
  details: string[];
  images: string[];
};

type Coupon = {
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
};

const properties: Property[] = [
  {
    id: 1,
    name: "Girls PG Near SPM IAS Academy",
    location: "Near SPM Lallans Coaching",
    locality: "Zoo Road",
    price: 7500,
    verified: true,
    category: "PG",
    details: ["Girls PG", "Single/Double", "Meals Included", "WiFi Available"],
    images: ["https://picsum.photos/id/164/500/350", "https://picsum.photos/id/169/500/350", "https://picsum.photos/id/175/500/350"]
  },
  {
    id: 2,
    name: "Homestay In Zoo Road Guwahati",
    location: "Near Commerce College",
    locality: "Zoo Road",
    price: 12000,
    verified: true,
    category: "Homestay",
    details: ["Couple Friendly", "AC/Non-AC", "Meals Optional", "WiFi Available"],
    images: ["https://picsum.photos/id/20/500/350", "https://picsum.photos/id/22/500/350", "https://picsum.photos/id/28/500/350"]
  },
  {
    id: 3,
    name: "Emerald Valley Flat",
    location: "Dispur",
    locality: "Dispur",
    price: 18500,
    verified: true,
    category: "Flat",
    details: ["2 BHK", "3rd Floor", "Semi-Furnished", "Parking Available"],
    images: ["https://picsum.photos/id/106/500/350", "https://picsum.photos/id/108/500/350", "https://picsum.photos/id/112/500/350"]
  },
  {
    id: 4,
    name: "2 BHK + Store Room in Sachal",
    location: "VIP Road Six-Mile, Near Zudio",
    locality: "Six-Mile",
    price: 8000,
    verified: true,
    category: "Roommate",
    details: ["House", "2 BHK + Store", "Ground Floor", "No Brokerage"],
    images: ["https://picsum.photos/id/152/500/350", "https://picsum.photos/id/155/500/350", "https://picsum.photos/id/159/500/350"]
  },
  {
    id: 5,
    name: "Velvet Suites PG for Women",
    location: "Beltola",
    locality: "Beltola",
    price: 9500,
    verified: true,
    category: "PG",
    details: ["Girls PG", "Meals Included", "Power Backup", "WiFi Available"],
    images: ["https://picsum.photos/id/29/500/350", "https://picsum.photos/id/39/500/350", "https://picsum.photos/id/42/500/350"]
  },
  {
    id: 6,
    name: "Riverside Opus Homestay",
    location: "Fancy Bazar",
    locality: "Fancy Bazar",
    price: 14500,
    verified: false,
    category: "Homestay",
    details: ["Family Friendly", "Meals Included", "Private Entry", "Market Access"],
    images: ["https://picsum.photos/id/96/500/350", "https://picsum.photos/id/98/500/350", "https://picsum.photos/id/100/500/350"]
  },
  {
    id: 7,
    name: "2BHK Grandeur Flat",
    location: "GS Road",
    locality: "GS Road",
    price: 22000,
    verified: true,
    category: "Flat",
    details: ["2 BHK", "2nd Floor", "Fully Furnished", "Parking Available"],
    images: ["https://picsum.photos/id/177/500/350", "https://picsum.photos/id/179/500/350", "https://picsum.photos/id/190/500/350"]
  },
  {
    id: 8,
    name: "Room for Rent - Student Friendly",
    location: "Jayanagar",
    locality: "Jayanagar",
    price: 5500,
    verified: true,
    category: "Roommate",
    details: ["Single Room", "1st Floor", "WiFi Available", "Low Deposit"],
    images: ["https://picsum.photos/id/202/500/350", "https://picsum.photos/id/205/500/350", "https://picsum.photos/id/210/500/350"]
  }
];

const couponMap: Record<string, Coupon> = {
  WELCOME10: { code: "WELCOME10", label: "10% off your first booking", type: "percent", value: 10 },
  APNA500: { code: "APNA500", label: "Flat INR 500 off applied", type: "flat", value: 500 },
  STUDENT20: { code: "STUDENT20", label: "20% student discount applied", type: "percent", value: 20 }
};

const categories: Array<{ value: "all" | PropertyCategory; label: string; icon: string }> = [
  { value: "all", label: "All Estates", icon: "bi-crown-fill" },
  { value: "PG", label: "PG Luxury", icon: "bi-building" },
  { value: "Homestay", label: "Homestay", icon: "bi-flower1" },
  { value: "Flat", label: "Flats", icon: "bi-door-closed-fill" },
  { value: "Roommate", label: "Rooms for Rent", icon: "bi-door-open-fill" }
];

const locations = ["GS Road", "Zoo Road", "Panbazar", "Dispur", "Beltola", "Fancy Bazar", "Six-Mile", "Jayanagar"];

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function tokenFor(property: Property) {
  return Math.floor(property.price * 0.1);
}

function discountedToken(token: number, coupon: Coupon | null) {
  if (!coupon) return token;
  if (coupon.type === "flat") return Math.max(0, token - coupon.value);
  return token - Math.floor((token * coupon.value) / 100);
}

export default function HomePage() {
  const [category, setCategory] = useState<"all" | PropertyCategory>("all");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [radius, setRadius] = useState(2);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponStatus, setCouponStatus] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("apnarooms_recent");
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {
      localStorage.removeItem("apnarooms_recent");
    }
  }, []);

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
  }, [category, location, maxPrice, minPrice, query]);

  const recentProperties = recentIds
    .map((id) => properties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));

  const token = selectedProperty ? tokenFor(selectedProperty) : 0;
  const total = discountedToken(token, activeCoupon);
  const savings = token - total;

  function openBooking(property: Property) {
    setSelectedProperty(property);
    setRecentIds((current) => {
      const next = [property.id, ...current.filter((id) => id !== property.id)].slice(0, 5);
      localStorage.setItem("apnarooms_recent", JSON.stringify(next));
      return next;
    });
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponStatus("Please enter a code first.");
      return;
    }
    const coupon = couponMap[code];
    if (!coupon) {
      setActiveCoupon(null);
      setCouponStatus("Invalid code. Try WELCOME10, APNA500, or STUDENT20.");
      return;
    }
    setActiveCoupon(coupon);
    setCouponStatus(coupon.label);
  }

  function shareProperty(property: Property) {
    const text = `ApnaRooms listing: ${property.name}\n${property.locality} | ${formatMoney(property.price)}/mo\nhttps://apnarooms.com/property/${property.id}`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function detectLocation() {
    setLocation("GS Road");
    setQuery("");
    setRadius(2);
    window.alert("Demo location detected. Showing listings near GS Road.");
  }

  return (
    <main className="tenant-site">
      <nav className="navbar-lux">
        <a className="navbar-brand-lux" href="#">
          <i className="bi bi-house-heart-fill" />
          ApnaRooms.com
        </a>
        <div className="nav-link-wrap">
          <a href="#listings">Listings</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          <a href="#coupon">Offers</a>
          <a href="/login">Account</a>
        </div>
        <a className="trust-gold" href="/admin">
          Admin Login
        </a>
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

        {filtered.length ? (
          <div className="property-grid-lux">
            {filtered.map((property) => (
              <article className="property-card-lux" key={property.id}>
                <div className="img-zoom-wrapper">
                  <div className="card-slider" aria-label={`${property.name} image gallery`}>
                    {property.images.map((image, index) => (
                      <img key={image} src={image} alt={`${property.name} view ${index + 1}`} />
                    ))}
                  </div>
                  <div className="carousel-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  {property.verified ? <span className="verified-lux-badge">Certified Gold</span> : <span className="review-badge">Reviewing</span>}
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
                      <button type="button" className="btn-book-lux" onClick={() => openBooking(property)}>
                        Secure Book
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results-lux">
            <i className="bi bi-emoji-frown" />
            <p>No properties found. Try a different filter or location.</p>
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
              <img src={property.images[0]} alt="" />
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
          <h2>Have a Coupon or Referral Code?</h2>
          <p>Apply your coupon to get exclusive discounts on token booking.</p>
          <div className="coupon-input-wrap">
            <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Enter coupon or referral code" />
            <button type="button" onClick={applyCoupon}>Apply</button>
          </div>
          <div className="coupon-result">{couponStatus}</div>
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
            ["Tenant Tips", "5 Things to Check Before Renting a PG in Guwahati", "https://picsum.photos/id/251/500/300"],
            ["Market Trends", "Rental Prices in Guwahati: Area-by-Area Breakdown", "https://picsum.photos/id/188/500/300"],
            ["Legal Guide", "Rental Agreement in Assam: What You Must Know", "https://picsum.photos/id/225/500/300"]
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
            <a href="#about">About Us</a>
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
                <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="WELCOME10 / APNA500 / STUDENT20" />
                <button type="button" onClick={applyCoupon}>Apply</button>
              </div>
              <button
                type="button"
                className="pay-cta-lux"
                onClick={() => {
                  window.alert(`Razorpay checkout will open for ${formatMoney(total)} once keys are configured.`);
                  setSelectedProperty(null);
                }}
              >
                Continue to Razorpay Checkout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
