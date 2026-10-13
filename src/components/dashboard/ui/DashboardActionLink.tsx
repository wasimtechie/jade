"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";

type DashboardActionLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function DashboardActionLink({
  href,
  label,
  icon: Icon,
}: DashboardActionLinkProps) {
  return (
    <Link
      href={href}
      className={`${dash.btn} ${dash.btnText} shrink-0`}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--dash-accent)" }} aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
