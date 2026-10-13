import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Save Jade Hospitainment VILLAS to compare later. Content is personalized in-browser and is not an authoritative catalog page.",
  alternates: { canonical: "https://jadehospitainment.com/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children;
}
