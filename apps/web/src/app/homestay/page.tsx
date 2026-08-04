import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Homestay in Guwahati | ApnaRooms",
  description: "Browse live homestay listings in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/homestay" }
};

export default function HomestayPage() {
  return <HomePageContent initialCategory="HOMESTAY" listingPage />;
}
