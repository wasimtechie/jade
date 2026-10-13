"use client";

import { Blocks, BedDouble, AlertTriangle } from "lucide-react";
import { roleCanRead } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";
import { useSession } from "next-auth/react";
import { CalendarGrid } from "@/components/dashboard/CalendarGrid";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardActionLink } from "./ui/DashboardActionLink";

export function CalendarPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const shortcuts = [
    role && roleCanRead("/dashboard/housekeeping", role)
      ? {
          href: "/dashboard/housekeeping",
          label: "Housekeeping",
          icon: BedDouble,
        }
      : null,
    role && roleCanRead("/dashboard/blocks", role)
      ? { href: "/dashboard/blocks", label: "Manual blocks", icon: Blocks }
      : null,
    role && roleCanRead("/dashboard/conflicts", role)
      ? {
          href: "/dashboard/conflicts",
          label: "Conflicts",
          icon: AlertTriangle,
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof Blocks;
  }>;

  return (
    <>
      {shortcuts.length > 0 && (
        <div className={`${dash.scrollRow} mb-2`}>
            {shortcuts.map((item) => (
              <DashboardActionLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </div>
        )}
      <CalendarGrid />
    </>
  );
}
