import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "PG in Guwahati | ApnaRooms",
  description: "Browse live PG listings in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/pg" }
};

export default function PgPage() {
  return <HomePageContent initialCategory="PG" />;
}
