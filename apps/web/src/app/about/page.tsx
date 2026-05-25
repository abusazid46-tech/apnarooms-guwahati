import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Apnarooms.com",
  description: "Northeast India's growing accommodation discovery and booking platform."
};

const paragraphs = [
  "Finding a good place to stay in a new city is often stressful, expensive, and time-consuming.",
  "Apnarooms.com is a growing accommodation discovery and booking platform that helps people find PGs, hostels, rental rooms and homestays, in an easier and more transparent way. Our goal is to build a platform where users can discover verified accommodation options without unnecessary hassle and confusion. We believe that everyone deserves a safe, comfortable, and affordable place to stay, whether they are moving for education, work, business, or travel.",
  "Founded with a vision to support people across Assam and the Northeast, Apnarooms.com understands the unique challenges faced by students and professionals who move to cities for studies, jobs, coaching, or business opportunities. Every year, thousands of people from different parts of the Northeast shift to cities like Guwahati, Shillong, Itanagar, Siliguri, and other growing urban centers in search of better opportunities. However, finding a genuine and affordable place to stay remains one of the biggest challenges for them. Most people still depend on brokers, local contacts, or random social media posts, which often leads to confusion, scams, and unnecessary expenses.",
  "Apnarooms.com was built to change this experience by creating a modern and user-friendly accommodation platform specially focused on the needs of people from the Northeast region. Our mission is to simplify the room-searching process and make accommodation accessible to everyone through technology and transparency.",
  "At Apnarooms.com, users can explore different types of accommodations based on their budget, location, and lifestyle needs. Whether someone is looking for a student PG near a coaching institute, a rental room for work, a hostel, a family flat, or a peaceful homestay while traveling in the Northeast, our platform aims to provide practical and affordable options in one place.",
  "We are especially committed to supporting students and young professionals because we understand the emotional and financial challenges people face while relocating to a new city. Our platform is designed to reduce stress and save time by helping users discover accommodation options more easily and confidently.",
  "At the same time, Apnarooms.com also helps property owners grow digitally by giving them a platform to showcase their rooms, PGs, flats, hotels, and homestays to a larger audience. We aim to create a strong connection between property owners and customers through a transparent and efficient system.",
  "Our long-term vision is to become the leading accommodation and booking platform of the Northeast and eventually expand across India. We want to build a future where finding a room or stay becomes simple, secure, and brokerage-friendly for everyone.",
  "At its core, Apnarooms.com is more than just a website - it is a platform built to support the people of Assam and the Northeast by making accommodation searching easier, smarter, and more accessible."
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <nav className="about-nav">
        <a className="navbar-brand-lux" href="/">
          <i className="bi bi-house-heart-fill" />
          ApnaRooms.com
        </a>
        <a className="admin-button" href="/">Back to Home</a>
      </nav>

      <section className="about-hero-page">
        <div>
          <span className="blog-tag">About Us</span>
          <h1>Accommodation discovery made simpler for Assam and the Northeast.</h1>
          <p>Apnarooms.com connects users with practical, verified stay options while helping property owners grow digitally.</p>
        </div>
      </section>

      <section className="about-content-page">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <strong>Apnarooms.com - Northeast India's Growing Accommodation Platform.</strong>
      </section>
    </main>
  );
}
