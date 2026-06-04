type SeoLandingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

export function SeoLandingPage({
  eyebrow,
  title,
  intro,
  bullets,
  primaryHref = "/#listings",
  primaryLabel = "View Live Listings"
}: SeoLandingPageProps) {
  return (
    <main className="seo-page">
      <nav className="about-nav">
        <a className="navbar-brand-lux" href="/">
          <img src="/brand/apnarooms-logo.png" alt="ApnaRooms.com" />
        </a>
        <a className="admin-button" href={primaryHref}>{primaryLabel}</a>
      </nav>

      <section className="seo-hero">
        <div>
          <span className="blog-tag">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="seo-actions">
            <a className="admin-button" href={primaryHref}>{primaryLabel}</a>
            <a className="seo-secondary-link" href="/dashboard?owner=1">List Your Property</a>
          </div>
        </div>
      </section>

      <section className="seo-content">
        {bullets.map((item) => (
          <article key={item}>
            <i className="bi bi-check2-circle" />
            <p>{item}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
