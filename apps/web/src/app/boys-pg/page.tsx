import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Boys PG in Guwahati | ApnaRooms",
  description: "Browse live boys PG listings in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/boys-pg" }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BoysPgPage() {
  return <HomePageContent initialCategory="BOYS_PG" listingPage />;
}
