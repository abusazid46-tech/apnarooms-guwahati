import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.apnarooms.com"),
  title: {
    default: "ApnaRooms | PGs, Rooms, Flats and Homestays in Guwahati",
    template: "%s"
  },
  description: "Find PGs, rental rooms, flats and homestays in Guwahati with ApnaRooms. Discover brokerage-friendly verified accommodation and book securely.",
  alternates: {
    canonical: "https://www.apnarooms.com"
  },
  openGraph: {
    title: "ApnaRooms | PGs, Rooms, Flats and Homestays in Guwahati",
    description: "Discover brokerage-friendly PGs, rooms, flats and homestays in Guwahati.",
    url: "https://www.apnarooms.com",
    siteName: "ApnaRooms",
    images: ["/brand/apnarooms-logo.png"],
    type: "website"
  },
  icons: {
    icon: "/brand/apnarooms-icon.jpeg",
    shortcut: "/brand/apnarooms-icon.jpeg",
    apple: "/brand/apnarooms-icon.jpeg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
