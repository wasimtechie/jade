import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BedDouble,
  Blocks,
  Briefcase,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  Globe,
  ImageIcon,
  Inbox,
  LineChart,
  Map,
  ScrollText,
  Settings,
  Shield,
  Terminal,
  Users,
  Webhook,
  Wrench,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section?: string;
  description?: string;
};

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Calendar",
    icon: CalendarDays,
    section: "Operations",
    description:
      "Full portfolio availability — bookings, manual blocks, and occupancy at a glance.",
  },
  {
    href: "/dashboard/bookings",
    label: "Booking Records",
    icon: ClipboardList,
    section: "Operations",
    description:
      "All reservations — direct, staff manual, and OTA — with folio and activity history.",
  },
  {
    href: "/dashboard/housekeeping",
    label: "Housekeeping",
    icon: BedDouble,
    section: "Operations",
    description: "Stay status for in-house and upcoming arrivals.",
  },
  {
    href: "/dashboard/blocks",
    label: "Manual Blocks",
    icon: Blocks,
    section: "Operations",
    description:
      "Owner holds and walk-in blocks — shown on the calendar as blocked dates.",
  },
  {
    href: "/dashboard/conflicts",
    label: "Conflicts",
    icon: AlertTriangle,
    section: "Operations",
    description: "Axis Rooms sync conflicts that need staff resolution.",
  },
  {
    href: "/dashboard/leads",
    label: "Leads & Enquiries",
    icon: Inbox,
    section: "Operations",
    description:
      "Website enquiry forms — tagged by page (Wedding, Party villas, Corporate, etc.).",
  },
  {
    href: "/dashboard/careers",
    label: "Careers",
    icon: Briefcase,
    section: "Operations",
    description: "Job applications with résumé download and hiring status.",
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    icon: CreditCard,
    section: "Operations",
    description:
      "Razorpay orders, deposits, and refund activity from confirmed bookings.",
  },
  {
    href: "/dashboard/settings/villas",
    label: "Villa Settings",
    icon: Settings,
    section: "Settings",
    description: "Portfolio villas, pricing, media, and bookable flags.",
  },
  {
    href: "/dashboard/settings/axis-rooms",
    label: "Axis Rooms",
    icon: Globe,
    section: "Settings",
    description: "Axis Rooms property mapping and sync status.",
  },
  {
    href: "/dashboard/staff",
    label: "User Management",
    icon: Users,
    section: "Settings",
    description: "Staff accounts, roles, suspension, and password resets.",
  },
  {
    href: "/dashboard/staff/roles",
    label: "Roles & Permissions",
    icon: Shield,
    section: "Settings",
    description: "RBAC matrix — which roles can read or write each module.",
  },
  {
    href: "/dashboard/seo/manager",
    label: "SEO Manager",
    icon: Globe,
    section: "SEO",
    description: "Site health, audits, canonicals, OG, schema, and robots.",
  },
  {
    href: "/dashboard/seo/redirects",
    label: "Redirects",
    icon: ScrollText,
    section: "SEO",
    description: "301/302 redirects, loop detection, and slug-change suggestions.",
  },
  {
    href: "/dashboard/media",
    label: "Media Library",
    icon: ImageIcon,
    section: "SEO",
    description: "Centralized images — uploads, public site assets, SEO metadata.",
  },
  {
    href: "/dashboard/seo/blogs",
    label: "Blogs",
    icon: FileText,
    section: "SEO",
    description: "Blog posts and editorial content pages.",
  },
  {
    href: "/dashboard/seo/sitemap",
    label: "Sitemap",
    icon: Map,
    section: "SEO",
    description: "Indexed URLs and sitemap inventory.",
  },
  {
    href: "/dashboard/seo/analytics",
    label: "Analytics",
    icon: LineChart,
    section: "SEO",
    description: "Booking and lead funnel snapshot metrics.",
  },
  {
    href: "/dashboard/dev/logs/api",
    label: "API Logs",
    icon: ScrollText,
    section: "Dev",
    description: "Staff audit trail for dashboard API actions.",
  },
  {
    href: "/dashboard/dev/logs/webhooks",
    label: "Webhook Logs",
    icon: Webhook,
    section: "Dev",
    description: "Inbound Razorpay and Axis Rooms webhook events.",
  },
  {
    href: "/dashboard/dev/logs/errors",
    label: "Error Logs",
    icon: Shield,
    section: "Dev",
    description: "Failed actions and error-class audit entries.",
  },
  {
    href: "/dashboard/dev/system",
    label: "System Config",
    icon: Wrench,
    section: "Dev",
    description: "Environment health, MongoDB, and runtime flags.",
  },
  {
    href: "/dashboard/dev/database",
    label: "Database",
    icon: Database,
    section: "Dev",
    description: "MongoDB collection counts and document samples.",
  },
  {
    href: "/dashboard/dev/debug",
    label: "Debug Panel",
    icon: Terminal,
    section: "Dev",
    description: "Smoke checks against key API routes.",
  },
];

export const DASHBOARD_BRAND = {
  title: "Jade Host",
  subtitle: "Property Management",
  accent: "#EFCD62",
} as const;

/** Resolve page label from pathname for dynamic document titles. */
export function dashboardTitleForPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/dashboard";
  if (normalized === "/dashboard/bookings") {
    return "Booking Records";
  }
  if (/^\/dashboard\/bookings\/[^/]+$/.test(normalized)) {
    return "Booking folio";
  }
  const match = matchNavForPath(pathname);
  return match?.label ?? "Dashboard";
}

/** Section label for current route (e.g. Operations, Settings). */
export function dashboardSectionForPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/dashboard";
  if (
    normalized === "/dashboard/bookings" ||
    /^\/dashboard\/bookings\/[^/]+$/.test(normalized)
  ) {
    return "Operations";
  }
  return matchNavForPath(pathname)?.section ?? null;
}

/** Page subtitle shown under the header title. */
export function dashboardDescriptionForPath(pathname: string): string | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/dashboard";
  if (normalized === "/dashboard/bookings") {
    return "Search and open any reservation — direct, staff hold, or OTA.";
  }
  if (/^\/dashboard\/bookings\/[^/]+$/.test(normalized)) {
    return "Guest booking folio — channel, payment, and full activity history.";
  }
  return matchNavForPath(pathname)?.description;
}

function matchNavForPath(pathname: string): NavItem | null {
  const normalized = pathname.replace(/\/+$/, "") || "/dashboard";
  let best: NavItem | null = null;
  for (const item of DASHBOARD_NAV) {
    const matches =
      normalized === item.href || normalized.startsWith(`${item.href}/`);
    if (!matches) continue;
    if (!best || item.href.length > best.href.length) best = item;
  }
  return best;
}
