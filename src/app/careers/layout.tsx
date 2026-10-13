// Route-segment layout — Server Component exports metadata for this client-component page
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Careers at Jade",
  description:
    "Join the Jade Hospitainment team. Open roles in sales, content creation, photography, video editing, and marketing. Work where standards matter.",
  alternates: { canonical: "https://jadehospitainment.com/careers" },
  openGraph: {
    title: "Careers | Jade Hospitainment",
    description:
      "Careers at Jade Hospitainment — sales, content, photography, video, and marketing roles at India's premium private retreat operator.",
    url: "https://jadehospitainment.com/careers",
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
      name: "Careers",
      item: "https://jadehospitainment.com/careers",
    },
  ],
};

const jobPostingSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Multiple Roles — Sales, Content Creator, Photographer, Video Editor",
  description:
    "Jade Hospitainment is hiring across sales, content creation, photography, video editing, and marketing. Join our growing team.",
  hiringOrganization: {
    "@type": "Organization",
    name: "Jade Hospitainment",
    sameAs: "https://jadehospitainment.com",
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressCountry: "IN",
    },
  },
  employmentType: "FULL_TIME",
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={jobPostingSchema} />
      {children}
    </>
  );
}
