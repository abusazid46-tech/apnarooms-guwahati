import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Property Listings | ApnaRooms",
  description: "Browse live ApnaRooms property listings including PGs, rooms, flats and homestays.",
  alternates: { canonical: "https://www.apnarooms.com/properties" }
};

export default function PropertiesPage() {
  return (
    <SeoLandingPage
      eyebrow="Properties"
      title="Browse ApnaRooms property listings"
      intro="Find live PGs, rental rooms, flats and homestays listed on ApnaRooms. Use the main listings section for current availability and secure booking."
      bullets={[
        "Live inventory is available on the ApnaRooms homepage listing section.",
        "Filter by category, locality and budget before starting a booking.",
        "Owners can list PGs, rooms, flats and homestays for admin approval.",
        "ApnaRooms focuses on brokerage-friendly accommodation discovery across Guwahati and the Northeast."
      ]}
    />
  );
}
