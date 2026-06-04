import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApnaRooms",
  description: "Zero-brokerage rentals in Guwahati",
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
