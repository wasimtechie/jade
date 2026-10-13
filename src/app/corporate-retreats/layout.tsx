import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Retreats & Offsites",
  description:
    "Host corporate offsites and team retreats at Jade Hospitainment's private luxury villas near Bangalore — exclusive buyouts, flexible catering, and inspiring spaces.",
  alternates: {
    canonical: "https://jadehospitainment.com/corporate-retreats",
  },
  openGraph: {
    title: "Corporate Retreats | Jade Hospitainment",
    description:
      "Private corporate offsite venues near Bangalore designed for focused sessions and team alignment.",
    url: "https://jadehospitainment.com/corporate-retreats",
  },
};

export default function CorporateRetreatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
