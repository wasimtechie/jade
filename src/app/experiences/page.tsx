import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { resolveLandingSections } from "@/lib/cms/landingCms";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";

const TEMPLATE_KEY = "landing/experiences";

export const metadata: Metadata = {
  title: "Curated Experiences",
  description:
    "Discover curated luxury experiences near Bangalore — from poolside getaways and bonfire nights to private dining and wellness retreats at Jade Hospitainment.",
  alternates: { canonical: "https://jadehospitainment.com/experiences" },
  openGraph: {
    title: "Curated Experiences | Jade Hospitainment",
    description:
      "Curated luxury experiences: poolside mornings, bonfire nights, outdoor dining, and more at exclusive Jade Private Villas.",
    url: "https://jadehospitainment.com/experiences",
  },
};

export const revalidate = 60;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://jadehospitainment.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Experiences",
      item: "https://jadehospitainment.com/experiences",
    },
  ],
};

const tripSchema = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: "Curated Luxury Experiences by Jade Hospitainment",
  description:
    "Bespoke curated experiences — poolside retreats, bonfire nights, private dining, and wellness — at exclusive VILLAS near Bangalore.",
  provider: {
    "@type": "Organization",
    name: "Jade Hospitainment",
    url: "https://jadehospitainment.com",
  },
};

export default function ExperiencesPage() {
  const sections = resolveLandingSections(TEMPLATE_KEY, null);

  return (
    <main className="min-h-screen bg-[#1A1C1E]">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={tripSchema} />
      <Navbar />
      <LandingPageRenderer templateKey={TEMPLATE_KEY} sections={sections} />
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
