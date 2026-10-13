// Route-segment layout — Server Component exports metadata for this client-component page
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Jade Hospitainment to plan your villa stay, destination wedding, corporate retreat, or curated experience near Bangalore.",
  alternates: { canonical: "https://jadehospitainment.com/contact" },
  openGraph: {
    title: "Contact Jade Hospitainment",
    description:
      "Reach us for villa bookings, event planning, and curated experiences. Available Mon–Sat, 10AM–7PM.",
    url: "https://jadehospitainment.com/contact",
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
      name: "Contact",
      item: "https://jadehospitainment.com/contact",
    },
  ],
};

export default function ContactLayout({
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
