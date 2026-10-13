// Route-segment layout — Server Component exports metadata for this client-component page
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Rathaa — Caravan Escapes",
  description:
    "Explore India's roads in Rathaa by Jade — a fully equipped luxury caravan for small groups, private road trips, celebrations, and scenic escapes near Bangalore.",
  alternates: { canonical: "https://jadehospitainment.com/caravans" },
  openGraph: {
    title: "Rathaa Caravan Escapes | Jade Hospitainment",
    description:
      "A private luxury caravan experience for small groups — curated road journeys, celebrations, and escapes beyond Bangalore.",
    url: "https://jadehospitainment.com/caravans",
  },
};

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
      name: "Caravan Escapes",
      item: "https://jadehospitainment.com/caravans",
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rathaa Caravan Escapes — Jade Hospitainment",
  description:
    "Fully equipped luxury caravan for private small-group road journeys, scenic escapes, and celebrations near Bangalore.",
  provider: {
    "@type": "Organization",
    name: "Jade Hospitainment",
    url: "https://jadehospitainment.com",
  },
  areaServed: { "@type": "Place", name: "Bangalore, India" },
};

export default function CaravansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={serviceSchema} />
      {children}
    </>
  );
}
