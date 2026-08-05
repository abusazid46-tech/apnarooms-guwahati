import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Hostel in Guwahati | ApnaRooms",
  description: "Browse live hostel listings in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/hostel" }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HostelPage() {
  return <HomePageContent initialCategory="HOSTEL" listingPage />;
}
