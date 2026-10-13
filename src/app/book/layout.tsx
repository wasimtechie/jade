import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Stay",
  description:
    "Book a private luxury villa near Bangalore — check availability, select dates, and pay securely with Jade Hospitainment.",
  alternates: { canonical: "https://jadehospitainment.com/book" },
  openGraph: {
    title: "Book Your Stay | Jade Hospitainment",
    description:
      "Reserve exclusive private villas near Bangalore with instant availability and secure payment.",
    url: "https://jadehospitainment.com/book",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
