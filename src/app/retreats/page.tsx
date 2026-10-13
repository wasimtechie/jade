import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import VillasHero from "@/components/VillasHero";
import MobileBottomNav from "@/components/MobileBottomNav";
import JsonLd from "@/components/seo/JsonLd";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const VillasCarousel = dynamic(() => import("@/components/VillasCarousel"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export const metadata: Metadata = {
  title: "Luxury Private Retreats",
  description:
    "Explore Jade Hospitainment's portfolio of exclusive private villas near Bangalore — perfect for group getaways, celebrations, and corporate offsites.",
  alternates: { canonical: "https://jadehospitainment.com/retreats/" },
  openGraph: {
    title: "Luxury Private Retreats | Jade Hospitainment",
    description:
      "Exclusive private villa estates near Bangalore for groups, celebrations, and corporate teams.",
    url: "https://jadehospitainment.com/retreats/",
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
      name: "Retreats",
      item: "https://jadehospitainment.com/retreats/",
    },
  ],
};

const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Jade Hospitainment — Luxury Villas",
  url: "https://jadehospitainment.com/retreats/",
  description:
    "Exclusive private villa estates near Bangalore ideal for group stays, corporate retreats, and celebrations.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
  priceRange: "₹₹₹₹",
};

export default function VillasPage() {
  return (
    <main className="bg-[#1A1C1E] min-h-screen">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={lodgingSchema} />
      <Navbar />
      <VillasHero />
      <Suspense fallback={<div className="h-screen bg-[#1A1C1E]" />}>
        <VillasCarousel />
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
