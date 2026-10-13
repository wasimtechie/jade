// Route-segment layout — Server Component sets noindex for menu page
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Jade Hospitainment",
  description: "Browse Jade Hospitainment's VILLAS, experiences, and more.",
  // Menu is a UI nav page — should not appear in search results
  robots: { index: false, follow: true },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
