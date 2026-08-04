import type { Metadata } from "next";
import { HomePageContent } from "@/components/HomePageContent";

export const metadata: Metadata = {
  title: "Rooms for Rent in Guwahati | ApnaRooms",
  description: "Browse live rooms for rent in Guwahati with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/rooms" }
};

export default function RoomsPage() {
  return <HomePageContent initialCategory="ROOM" />;
}
