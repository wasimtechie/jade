import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekend Getaways",
  description:
    "Escape Bangalore for a luxury weekend getaway at Jade Hospitainment's private villas — pools, bonfires, and curated experiences.",
  alternates: {
    canonical: "https://jadehospitainment.com/weekend-getaways",
  },
  openGraph: {
    title: "Weekend Getaways | Jade Hospitainment",
    description:
      "Luxury weekend escapes near Bangalore at exclusive private villa estates.",
    url: "https://jadehospitainment.com/weekend-getaways",
  },
};

export default function WeekendGetawaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
