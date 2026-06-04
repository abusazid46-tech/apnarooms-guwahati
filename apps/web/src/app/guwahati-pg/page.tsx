import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";

export const metadata: Metadata = {
  title: "PG in Guwahati | Boys PG, Girls PG and Student PG | ApnaRooms",
  description: "Find PG in Guwahati for students and working professionals. Browse verified boys PG, girls PG and managed stays with ApnaRooms.",
  alternates: { canonical: "https://www.apnarooms.com/guwahati-pg" }
};

export default function GuwahatiPgPage() {
  return (
    <SeoLandingPage
      eyebrow="PG in Guwahati"
      title="Verified PG options in Guwahati"
      intro="Find PG accommodation in Guwahati for study, coaching, work or relocation. ApnaRooms keeps PG discovery simple with live listings and secure booking flow."
      bullets={[
        "Explore boys PG, girls PG and student-friendly PG options in Guwahati.",
        "Check meals, Wi-Fi, parking, AC availability and locality before booking.",
        "Useful for students near coaching institutes and professionals moving to Guwahati.",
        "Book through ApnaRooms or contact the team on WhatsApp for quick support."
      ]}
    />
  );
}
