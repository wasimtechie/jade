export type Role = "admin" | "staff" | "team" | "seo" | "dev";
export type AccessLevel = "write" | "read" | "none";

export const ALL_ROLES: Role[] = ["admin", "staff", "team", "seo", "dev"];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  team: "Team",
  seo: "SEO",
  dev: "Dev",
};

export type RouteMatrixEntry = {
  path: string;
  label: string;
  perms: Partial<Record<Role, AccessLevel>>;
};

/**
 * Route permission matrix — backend source of truth for RBAC.
 * Order does not matter: `canAccess` resolves the LONGEST matching prefix.
 */
export const ROUTE_MATRIX: RouteMatrixEntry[] = [
  {
    path: "/dashboard",
    label: "Calendar",
    perms: { admin: "write", staff: "write", team: "read", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/bookings",
    label: "Booking Records",
    perms: { admin: "write", staff: "write", team: "read", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/housekeeping",
    label: "Housekeeping",
    perms: { admin: "write", staff: "write", team: "write", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/blocks",
    label: "Manual Blocks",
    perms: { admin: "write", staff: "write", team: "none", seo: "none", dev: "none" },
  },
  {
    path: "/dashboard/conflicts",
    label: "Conflicts",
    perms: { admin: "write", staff: "read", team: "none", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/leads",
    label: "Leads & Enquiries",
    perms: { admin: "write", staff: "write", team: "read", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/careers",
    label: "Careers",
    perms: { admin: "write", staff: "write", team: "read", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/payments",
    label: "Payments",
    perms: { admin: "write", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/settings/villas",
    label: "Villa Settings",
    perms: { admin: "write", staff: "none", team: "none", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/settings/axis-rooms",
    label: "Axis Rooms",
    perms: { admin: "write", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/staff",
    label: "User Management",
    perms: { admin: "write", staff: "none", team: "none", seo: "none", dev: "read" },
  },
  {
    path: "/dashboard/media",
    label: "Media Library",
    perms: { admin: "write", staff: "read", team: "none", seo: "write", dev: "read" },
  },
  {
    path: "/dashboard/seo",
    label: "SEO",
    perms: { admin: "write", staff: "read", team: "none", seo: "write", dev: "none" },
  },
  {
    path: "/dashboard/seo/redirects",
    label: "Redirects",
    perms: { admin: "write", staff: "read", team: "none", seo: "write", dev: "none" },
  },
  {
    path: "/dashboard/seo/manager",
    label: "SEO Manager",
    perms: { admin: "write", staff: "read", team: "none", seo: "write", dev: "none" },
  },
  {
    path: "/dashboard/dev",
    label: "Dev Tools",
    perms: { admin: "none", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/logs/errors",
    label: "Error Logs",
    perms: { admin: "read", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/logs/webhooks",
    label: "Webhook Logs",
    perms: { admin: "read", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/logs/api",
    label: "API Logs",
    perms: { admin: "none", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/system",
    label: "System Config",
    perms: { admin: "none", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/database",
    label: "Database",
    perms: { admin: "none", staff: "none", team: "none", seo: "none", dev: "write" },
  },
  {
    path: "/dashboard/dev/debug",
    label: "Debug Panel",
    perms: { admin: "none", staff: "none", team: "none", seo: "none", dev: "write" },
  },
];

/**
 * Resolve a dashboard or API path to the RBAC matrix key (longest prefix).
 * API-only routes (e.g. /dashboard/calendar) map to their parent module.
 */
export function resolvePermissionPath(path: string): string {
  const normalized = path.replace(/\/+$/, "") || "/dashboard";

  let best: RouteMatrixEntry | null = null;
  for (const entry of ROUTE_MATRIX) {
    const matches =
      normalized === entry.path ||
      (entry.path !== "/dashboard" && normalized.startsWith(`${entry.path}/`));
    if (!matches) continue;
    if (!best || entry.path.length > best.path.length) {
      best = entry;
    }
  }
  if (best) return best.path;

  const aliases: Array<{ prefix: string; permPath: string }> = [
    { prefix: "/dashboard/users", permPath: "/dashboard/staff" },
    { prefix: "/dashboard/calendar", permPath: "/dashboard" },
    { prefix: "/dashboard/media", permPath: "/dashboard/media" },
    { prefix: "/dashboard/content", permPath: "/dashboard/seo" },
  ];
  for (const { prefix, permPath } of aliases) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return permPath;
    }
  }

  if (normalized.startsWith("/dashboard/bookings")) return "/dashboard/bookings";

  return normalized;
}

/** True when permPath is a key in ROUTE_MATRIX. */
export function isRegisteredPermissionPath(permPath: string): boolean {
  return ROUTE_MATRIX.some((entry) => entry.path === permPath);
}

/**
 * Resolve access level for a route + role using the LONGEST matching prefix.
 * Defaults to "none" (deny) when no entry matches — no implicit admin/dev grants.
 */
export function canAccess(path: string, role: Role): AccessLevel {
  const permPath = resolvePermissionPath(path);

  const entry = ROUTE_MATRIX.find((e) => e.path === permPath);
  if (!entry) return "none";
  return entry.perms[role] ?? "none";
}

/**
 * Edge-safe RBAC check for middleware (JWT role only — DB re-validated in APIs).
 */
export function roleMeetsAccess(
  path: string,
  role: Role,
  min: "read" | "write",
): boolean {
  const level = canAccess(path, role);
  if (min === "write") return level === "write";
  return level === "read" || level === "write";
}

export function roleCanWrite(path: string, role: Role): boolean {
  return canAccess(path, role) === "write";
}

export function roleCanRead(path: string, role: Role): boolean {
  const level = canAccess(path, role);
  return level === "read" || level === "write";
}

/**
 * Real dashboard pages only (not permission-prefix paths like /dashboard/seo).
 * Order defines preferred landing route per role.
 */
const DASHBOARD_HOME_CANDIDATES = [
  "/dashboard",
  "/dashboard/housekeeping",
  "/dashboard/blocks",
  "/dashboard/conflicts",
  "/dashboard/leads",
  "/dashboard/careers",
  "/dashboard/payments",
  "/dashboard/settings/villas",
  "/dashboard/settings/axis-rooms",
  "/dashboard/staff",
  "/dashboard/staff/roles",
  "/dashboard/seo/blogs",
  "/dashboard/seo/manager",
  "/dashboard/seo/redirects",
  "/dashboard/media",
  "/dashboard/seo/sitemap",
  "/dashboard/seo/analytics",
  "/dashboard/dev/logs/api",
  "/dashboard/dev/logs/webhooks",
  "/dashboard/dev/logs/errors",
  "/dashboard/dev/system",
  "/dashboard/dev/database",
  "/dashboard/dev/debug",
] as const;

/** First dashboard route this role may open (avoids redirect loops). */
export function defaultDashboardHome(role: Role): string {
  for (const path of DASHBOARD_HOME_CANDIDATES) {
    if (canAccess(path, role) !== "none") return path;
  }
  return "/login";
}

/** Safe post-login destination — honors `next` only when the role may access it. */
export function resolvePostLoginPath(
  role: Role,
  next: string | null | undefined,
): string {
  if (next?.startsWith("/dashboard")) {
    const normalized = next.replace(/\/+$/, "") || "/dashboard";
    if (canAccess(normalized, role) !== "none") return normalized;
  }
  return defaultDashboardHome(role);
}

export { resolveApiPermission } from "./apiRouteRegistry";
