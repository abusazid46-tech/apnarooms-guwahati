import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Affordable Rooms for Rent in Guwahati | ApnaRooms",
  description: "Find affordable rooms, PGs, shared flats and homestays in Guwahati. Browse budget-friendly accommodation with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/affordable-rooms-for-rent-in-guwahati" }
};

export default function AffordableRoomsForRentInGuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Affordable Rooms"
      title="Affordable rooms for rent in Guwahati"
      intro="Find budget-friendly rooms, PGs and homestays in Guwahati through ApnaRooms. Compare location, rent and facilities before booking."
      bullets={[
        "PGs can include meals, Wi-Fi, housekeeping and a homely setup for students and professionals.",
        "Rental rooms and shared flats can help reduce monthly living cost in Guwahati.",
        "Homestays are useful for short stays, travel, work trips and family visits.",
        "ApnaRooms keeps discovery easier with verified listings and clear booking options."
      ]}
    />
  );
}
