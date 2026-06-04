import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Rent Room in Guwahati | Rooms Near Colleges and Offices | ApnaRooms",
  description: "Search rental rooms in Guwahati near colleges, offices and prime localities. Find brokerage-friendly rooms with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/rent-rooms-in-guwahati" }
};

export default function RentRoomsInGuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Rent Rooms in Guwahati"
      title="Rental rooms in Guwahati for students and professionals"
      intro="ApnaRooms helps people find rental rooms in Guwahati with practical details, verified listings and direct booking support."
      bullets={[
        "Search rooms near Guwahati Commerce College, Beltola, Six Mile, Zoo Road and other active areas.",
        "Compare monthly rent, token amount, locality and amenities before contacting or booking.",
        "Suitable for single professionals, students and people relocating to Guwahati.",
        "Use the live listings section to see currently available rooms."
      ]}
    />
  );
}
