import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using Jade Hospitainment digital properties, enquiry flows, and venue services in Karnataka, India.",
  alternates: { canonical: "https://jadehospitainment.com/terms-conditions" },
  openGraph: {
    title: "Terms & Conditions | Jade Hospitainment",
    description:
      "Legal terms for Jade Hospitainment services, website use, and bookings.",
    url: "https://jadehospitainment.com/terms-conditions",
    locale: "en_IN",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
