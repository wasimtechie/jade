// Route-segment layout — Server Component exports metadata for this client-component blogs list page
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import "@/styles/blog-prose.css";

export const metadata: Metadata = {
  title: "Blog — Luxury Travel & Villa Living",
  description:
    "Explore Jade Hospitainment's blog for curated travel guides, villa living tips, event inspiration, and stories from India's premium private retreat operator.",
  alternates: { canonical: "https://jadehospitainment.com/blogs/" },
  openGraph: {
    title: "Blog | Jade Hospitainment",
    description:
      "Travel guides, villa living tips, event inspiration, and premium retreat stories from Jade Hospitainment.",
    url: "https://jadehospitainment.com/blogs/",
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
      name: "Blog",
      item: "https://jadehospitainment.com/blogs/",
    },
  ],
};

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Jade Hospitainment Blog",
  description:
    "Travel guides, villa living tips, event inspiration, and stories from Jade's curated private retreat portfolio.",
  url: "https://jadehospitainment.com/blogs/",
  publisher: {
    "@type": "Organization",
    name: "Jade Hospitainment",
    url: "https://jadehospitainment.com",
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={blogSchema} />
      {children}
    </>
  );
}
