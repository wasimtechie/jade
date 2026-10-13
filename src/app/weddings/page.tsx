import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { resolveLandingSections } from "@/lib/cms/landingCms";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";

const TEMPLATE_KEY = "landing/weddings";

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
      name: "Weddings",
      item: "https://jadehospitainment.com/weddings",
    },
  ],
};

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Destination Weddings at Jade Hospitainment",
  description:
    "Bespoke destination wedding experiences at exclusive private estates near Bangalore.",
  location: {
    "@type": "Place",
    name: "Jade Hospitainment Private Estates",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressCountry: "IN",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Jade Hospitainment",
    url: "https://jadehospitainment.com",
  },
};

export default function WeddingPage() {
  const sections = resolveLandingSections(TEMPLATE_KEY, null);

  return (
    <main className="relative min-h-screen bg-[#1A1C1E]">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={eventSchema} />
      <Navbar />
      <LandingPageRenderer templateKey={TEMPLATE_KEY} sections={sections} />
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
