import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/dashboard.css";
import "@/styles/dashboard-forms.css";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
export const metadata: Metadata = {
  title: { absolute: "Jade Host — Staff Sign In" },
  description: "Staff portal for Jade Hospitainment property management.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
