import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "Best Girls PG Near Physics Wallah Guwahati | ApnaRooms",
  description: "Find girls PG near Physics Wallah Guwahati with ApnaRooms. Browse student-friendly PG options near coaching areas with meals, Wi-Fi and secure booking support.",
  alternates: { canonical: "https://www.apnarooms.com/best-girls-pg-near-physics-wallah-guwahati" }
};

export default function BestGirlsPgNearPhysicsWallahGuwahatiPage() {
  return (
    <SeoLandingPage
      eyebrow="Girls PG Near Physics Wallah"
      title="Girls PG near Physics Wallah Guwahati"
      intro="ApnaRooms helps students and parents discover girls PG options near Physics Wallah Guwahati and nearby coaching localities with clearer details and booking support."
      bullets={[
        "Browse verified and student-friendly girls PG listings in Guwahati.",
        "Check locality, monthly rent, meals, Wi-Fi, AC, parking and availability before booking.",
        "Useful for students moving to Guwahati for coaching, entrance preparation or college.",
        "Use the live listings section or WhatsApp support to confirm the latest availability near Physics Wallah."
      ]}
    />
  );
}
