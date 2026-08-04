import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Flats for Rent in Guwahati | ApnaRooms",
  description: "Browse live flats for rent in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/flats" }
};

export default function FlatsPage() {
  return <HomePageContent initialCategory="FLAT" />;
}
