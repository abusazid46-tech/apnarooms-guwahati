import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Property Listings | ApnaRooms",
  description: "Browse live ApnaRooms property listings including PGs, rooms, flats and homestays.",
  alternates: { canonical: "https://www.apnarooms.com/properties" }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PropertiesPage() {
  return <HomePageContent initialCategory="all" listingPage />;
}
