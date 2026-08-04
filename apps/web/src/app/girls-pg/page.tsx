import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Girls PG in Guwahati | ApnaRooms",
  description: "Browse live girls PG listings in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/girls-pg" }
};

export default function GirlsPgPage() {
  return <HomePageContent initialCategory="GIRLS_PG" />;
}
