import type { Metadata } from "next";
import SplashScreen from "@/components/SplashScreen";
import LandingPage from "@/components/LandingPage";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jade Hospitainment — Luxury Villas, Weddings & Experiences",
  description:
    "Discover curated Luxury Villas, bespoke destination weddings, caravans, corporate retreats, and immersive experiences near Bangalore with Jade Hospitainment.",
  alternates: { canonical: "https://jadehospitainment.com" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Jade Hospitainment",
  url: "https://jadehospitainment.com",
  logo: "https://jadehospitainment.com/assets/Golden_Logo.png",
  sameAs: [
    "https://www.instagram.com/jadehospitainment",
    "https://www.facebook.com/jadehospitainment",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-jade-dark">
      <JsonLd schema={organizationSchema} />
      {/* Client Component Overlay - Self-managing */}
      <SplashScreen />

      {/* Server Component - Rendered immediately behind the splash */}
      <LandingPage />
    </main>
  );
}
