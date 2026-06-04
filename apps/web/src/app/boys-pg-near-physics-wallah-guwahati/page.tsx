import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Boys PG Near Physics Wallah Guwahati | ApnaRooms",
  description: "Find boys PG near Physics Wallah Guwahati with ApnaRooms. Compare student PG options, amenities, rent and booking support.",
  alternates: { canonical: "https://www.apnarooms.com/boys-pg-near-physics-wallah-guwahati" }
};

export default function BoysPgNearPhysicsWallahGuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Boys PG Near Physics Wallah"
      title="Boys PG near Physics Wallah Guwahati"
      intro="ApnaRooms helps students find boys PG options near Physics Wallah Guwahati and nearby study areas with practical listing details and secure booking support."
      bullets={[
        "Explore boys PG listings suitable for students and young professionals in Guwahati.",
        "Compare rent, distance, meals, Wi-Fi, AC, parking and other important PG facilities.",
        "Helpful for students relocating for coaching, exam preparation, college or work.",
        "Check live ApnaRooms listings or contact support on WhatsApp for current availability near Physics Wallah."
      ]}
    />
  );
}
