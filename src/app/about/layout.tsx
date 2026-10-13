// Route-segment layout — Server Component exports metadata for this client-component page
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Jade Hospitainment",
  description:
    "Founded in 2011, Jade Hospitainment operates curated luxury Private Villas and retreat experiences near Bangalore — trusted by Google, Microsoft, IBM & more.",
  alternates: { canonical: "https://jadehospitainment.com/about" },
  openGraph: {
    title: "About Jade Hospitainment",
    description:
      "16 Luxury Villas, 7500+ check-ins, 100+ events hosted. The story behind India's premium private retreat operator.",
    url: "https://jadehospitainment.com/about",
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
      name: "About",
      item: "https://jadehospitainment.com/about",
    },
  ],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      {children}
    </>
  );
}
