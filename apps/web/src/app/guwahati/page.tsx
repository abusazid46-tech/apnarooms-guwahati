import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Guwahati Rooms, PGs, Flats and Homestays | ApnaRooms",
  description: "Find verified PGs, rental rooms, flats and homestays in Guwahati with ApnaRooms. Browse brokerage-friendly stays and book securely.",
  alternates: { canonical: "https://www.apnarooms.com/guwahati" }
};

export default function GuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Guwahati"
      title="Find rooms, PGs, flats and homestays in Guwahati"
      intro="ApnaRooms helps students, professionals, families and travelers discover verified accommodation options across Guwahati without unnecessary brokerage confusion."
      bullets={[
        "Browse live PG, rental room, flat and homestay listings from the ApnaRooms inventory.",
        "Compare budget, locality, amenities and availability before starting a booking.",
        "Popular Guwahati searches include Beltola, Six Mile, Zoo Road, Panjabari, Ganeshguri and GS Road.",
        "Property owners can submit listings for admin review and publish approved rooms on ApnaRooms."
      ]}
    />
  );
}
