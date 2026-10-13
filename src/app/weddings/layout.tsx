import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destination Weddings",
  description:
    "Host your dream wedding at Jade Hospitainment's boutique private estates near Bangalore — farmhouse gardens, private pools, and bespoke ceremonial experiences.",
  alternates: { canonical: "https://jadehospitainment.com/weddings" },
  openGraph: {
    title: "Destination Weddings | Jade Hospitainment",
    description:
      "Bespoke Garden & Farmhouse Weddings near Bangalore. Private estates. Intimate ceremonies. Unforgettable celebrations.",
    url: "https://jadehospitainment.com/weddings",
  },
};

export default function WeddingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
