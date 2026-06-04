import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Homestay in Guwahati | Daily Stay and Family Homestays | ApnaRooms",
  description: "Find homestays in Guwahati for short stays, family visits and travel. Browse daily-rate homestays with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/homestay-in-guwahati" }
};

export default function HomestayInGuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Homestay in Guwahati"
      title="Daily-rate homestays in Guwahati"
      intro="ApnaRooms lists homestays in Guwahati for travelers, families, students and professionals who need comfortable short-stay options."
      bullets={[
        "Browse homestays with daily pricing, Wi-Fi, parking, meals or AC where available.",
        "Useful for short trips, exam visits, medical travel, office work and Northeast travel plans.",
        "Popular homestay searches include Ganeshguri, GS Road, Six Mile, Jatia, Kahilipara and nearby areas.",
        "Use secure booking or WhatsApp support to check availability before arrival."
      ]}
    />
  );
}
