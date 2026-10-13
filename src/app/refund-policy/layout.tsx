import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund and cancellation policy for Jade Hospitainment villa and event bookings—read before confirming stays or celebrations.",
  alternates: { canonical: "https://jadehospitainment.com/refund-policy" },
  openGraph: {
    title: "Refund Policy | Jade Hospitainment",
    description: "Cancellation and refund terms for Jade Hospitainment bookings.",
    url: "https://jadehospitainment.com/refund-policy",
    locale: "en_IN",
    type: "website",
  },
};

export default function RefundLayout({ children }: { children: ReactNode }) {
  return children;
}
