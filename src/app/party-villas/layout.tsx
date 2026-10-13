import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Party Villas",
  description:
    "Celebrate in style at Jade Hospitainment party villas near Bangalore — private pools, expansive lawns, and exclusive group buyouts.",
  alternates: { canonical: "https://jadehospitainment.com/party-villas" },
  openGraph: {
    title: "Party Villas | Jade Hospitainment",
    description:
      "Private party villas near Bangalore for birthdays, celebrations, and group gatherings.",
    url: "https://jadehospitainment.com/party-villas",
  },
};

export default function PartyVillasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
