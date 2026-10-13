import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import "@/styles/dashboard.css";
import "@/styles/dashboard-polish.css";
import "@/styles/dashboard-forms.css";
import "@/styles/dashboard-responsive.css";
import "@/styles/calendar.css";
import "@/styles/villa-settings.css";

export const metadata: Metadata = {
  title: { absolute: "Jade Host — Dashboard" },
  description: "Jade Hospitainment property management dashboard.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthSessionProvider>
  );
}
