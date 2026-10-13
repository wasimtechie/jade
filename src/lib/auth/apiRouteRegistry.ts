/**
 * Authoritative map of protected dashboard API routes → RBAC permission paths.
 * Middleware and regression tests use this file — keep in sync with requireRole() in handlers.
 */

import { resolvePermissionPath } from "./permissions";

export type ApiAccess = {
  permPath: string;
  min: "read" | "write";
};

export type ApiRouteCase = {
  /** Human label for test output */
  label: string;
  pathname: string;
  method: string;
  search?: string;
  permPath: string;
  min: "read" | "write";
};

function minForMethod(method: string): "read" | "write" {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
    ? "write"
    : "read";
}

/**
 * Resolve middleware RBAC for protected staff API routes.
 * Returns null for public routes (bookings POST, auth, webhooks, etc.).
 */
export function resolveApiPermission(
  pathname: string,
  method: string,
  search = "",
): ApiAccess | null {
  const m = method.toUpperCase();
  const min = minForMethod(m);

  // ── Staff dashboard APIs (explicit — prevents path alias drift) ──────────

  if (pathname.startsWith("/api/dashboard/bookings")) {
    return { permPath: "/dashboard/bookings", min };
  }

  if (pathname.startsWith("/api/dashboard/users")) {
    return { permPath: "/dashboard/staff", min };
  }

  if (pathname.startsWith("/api/dashboard/calendar")) {
    return { permPath: "/dashboard", min };
  }

  if (pathname.startsWith("/api/dashboard/villas/")) {
    return { permPath: "/dashboard/settings/villas", min };
  }

  if (pathname === "/api/dashboard/villas") {
    if (m === "GET") {
      const params = new URLSearchParams(search.replace(/^\?/, ""));
      return {
        permPath:
          params.get("all") === "1"
            ? "/dashboard/settings/villas"
            : "/dashboard",
        min: "read",
      };
    }
    return { permPath: "/dashboard/settings/villas", min };
  }

  if (pathname.startsWith("/api/dashboard/media")) {
    return { permPath: "/dashboard/media", min };
  }

  if (pathname.startsWith("/api/dashboard/blocks")) {
    return { permPath: "/dashboard/blocks", min };
  }

  if (pathname.startsWith("/api/dashboard/conflicts")) {
    return { permPath: "/dashboard/conflicts", min };
  }

  if (pathname.startsWith("/api/dashboard/blogs")) {
    return { permPath: "/dashboard/seo", min };
  }

  if (pathname.startsWith("/api/dashboard/content")) {
    return { permPath: "/dashboard/seo", min };
  }

  if (pathname.startsWith("/api/dashboard/payments")) {
    return { permPath: "/dashboard/payments", min };
  }

  if (pathname.startsWith("/api/dashboard/settings/axis-rooms")) {
    return { permPath: "/dashboard/settings/axis-rooms", min };
  }

  if (pathname.startsWith("/api/dashboard/leads")) {
    return { permPath: "/dashboard/leads", min };
  }

  if (pathname.startsWith("/api/dashboard/careers")) {
    return { permPath: "/dashboard/careers", min };
  }

  if (pathname.startsWith("/api/dashboard/seo/")) {
    const dashPath = pathname.replace(/^\/api/, "");
    return { permPath: resolvePermissionPath(dashPath), min };
  }

  if (pathname.startsWith("/api/dashboard/dev/")) {
    const dashPath = pathname.replace(/^\/api/, "");
    return { permPath: resolvePermissionPath(dashPath), min };
  }

  // ── Bookings (staff) ───────────────────────────────────────────────────

  if (pathname === "/api/bookings" && m === "GET") {
    return { permPath: "/dashboard", min: "read" };
  }

  const bookingMatch = pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (bookingMatch) {
    if (m === "GET") {
      return { permPath: "/dashboard/bookings", min: "read" };
    }
    if (m === "PATCH") {
      return { permPath: "/dashboard/housekeeping", min: "write" };
    }
    if (m === "DELETE") {
      return { permPath: "/dashboard/bookings", min: "write" };
    }
  }

  // ── Uploaded media (GridFS) ─────────────────────────────────────────────

  if (pathname.startsWith("/api/media/")) {
    return { permPath: "/dashboard/settings/villas", min: "read" };
  }

  return null;
}

/**
 * Every protected API route we ship — used by regression tests to catch drift.
 * When adding a new dashboard API, add a case here AND requireRole() in the handler.
 */
export const API_ROUTE_CASES: ApiRouteCase[] = [
  {
    label: "booking records list",
    pathname: "/api/dashboard/bookings",
    method: "GET",
    permPath: "/dashboard/bookings",
    min: "read",
  },
  {
    label: "manual booking create",
    pathname: "/api/dashboard/bookings",
    method: "POST",
    permPath: "/dashboard/bookings",
    min: "write",
  },
  {
    label: "booking folio action",
    pathname: "/api/dashboard/bookings/JH-2026-001",
    method: "PATCH",
    permPath: "/dashboard/bookings",
    min: "write",
  },
  {
    label: "user list",
    pathname: "/api/dashboard/users",
    method: "GET",
    permPath: "/dashboard/staff",
    min: "read",
  },
  {
    label: "create user",
    pathname: "/api/dashboard/users",
    method: "POST",
    permPath: "/dashboard/staff",
    min: "write",
  },
  {
    label: "user detail",
    pathname: "/api/dashboard/users/6a3a23682bc8769215b6eb53",
    method: "GET",
    permPath: "/dashboard/staff",
    min: "read",
  },
  {
    label: "calendar",
    pathname: "/api/dashboard/calendar",
    method: "GET",
    permPath: "/dashboard",
    min: "read",
  },
  {
    label: "villa list (calendar)",
    pathname: "/api/dashboard/villas",
    method: "GET",
    permPath: "/dashboard",
    min: "read",
  },
  {
    label: "villa list (settings)",
    pathname: "/api/dashboard/villas",
    method: "GET",
    search: "?all=1",
    permPath: "/dashboard/settings/villas",
    min: "read",
  },
  {
    label: "villa detail",
    pathname: "/api/dashboard/villas/jade-745",
    method: "GET",
    permPath: "/dashboard/settings/villas",
    min: "read",
  },
  {
    label: "create villa",
    pathname: "/api/dashboard/villas",
    method: "POST",
    permPath: "/dashboard/settings/villas",
    min: "write",
  },
  {
    label: "media upload",
    pathname: "/api/dashboard/media/upload",
    method: "POST",
    permPath: "/dashboard/media",
    min: "write",
  },
  {
    label: "blocks list",
    pathname: "/api/dashboard/blocks",
    method: "GET",
    permPath: "/dashboard/blocks",
    min: "read",
  },
  {
    label: "delete block",
    pathname: "/api/dashboard/blocks/6a3a23682bc8769215b6eb53",
    method: "DELETE",
    permPath: "/dashboard/blocks",
    min: "write",
  },
  {
    label: "conflicts",
    pathname: "/api/dashboard/conflicts",
    method: "GET",
    permPath: "/dashboard/conflicts",
    min: "read",
  },
  {
    label: "leads list",
    pathname: "/api/dashboard/leads",
    method: "GET",
    permPath: "/dashboard/leads",
    min: "read",
  },
  {
    label: "careers list",
    pathname: "/api/dashboard/careers",
    method: "GET",
    permPath: "/dashboard/careers",
    min: "read",
  },
  {
    label: "career resume download",
    pathname: "/api/dashboard/careers/6a3a23682bc8769215b6eb53/resume",
    method: "GET",
    permPath: "/dashboard/careers",
    min: "read",
  },
  {
    label: "content cms",
    pathname: "/api/dashboard/content",
    method: "GET",
    permPath: "/dashboard/seo",
    min: "read",
  },
  {
    label: "payments",
    pathname: "/api/dashboard/payments",
    method: "GET",
    permPath: "/dashboard/payments",
    min: "read",
  },
  {
    label: "axis rooms sync log",
    pathname: "/api/dashboard/settings/axis-rooms/log",
    method: "GET",
    permPath: "/dashboard/settings/axis-rooms",
    min: "read",
  },
  {
    label: "axis rooms connected otas",
    pathname: "/api/dashboard/settings/axis-rooms/connected-otas",
    method: "GET",
    permPath: "/dashboard/settings/axis-rooms",
    min: "read",
  },
  {
    label: "axis rooms verify",
    pathname: "/api/dashboard/settings/axis-rooms/verify",
    method: "POST",
    permPath: "/dashboard/settings/axis-rooms",
    min: "write",
  },
  {
    label: "seo analytics",
    pathname: "/api/dashboard/seo/analytics",
    method: "GET",
    permPath: "/dashboard/seo",
    min: "read",
  },
  {
    label: "seo sitemap",
    pathname: "/api/dashboard/seo/sitemap",
    method: "GET",
    permPath: "/dashboard/seo",
    min: "read",
  },
  {
    label: "dev api logs",
    pathname: "/api/dashboard/dev/logs/api",
    method: "GET",
    permPath: "/dashboard/dev/logs/api",
    min: "read",
  },
  {
    label: "dev webhook logs",
    pathname: "/api/dashboard/dev/logs/webhooks",
    method: "GET",
    permPath: "/dashboard/dev/logs/webhooks",
    min: "read",
  },
  {
    label: "dev error logs",
    pathname: "/api/dashboard/dev/logs/errors",
    method: "GET",
    permPath: "/dashboard/dev/logs/errors",
    min: "read",
  },
  {
    label: "dev system",
    pathname: "/api/dashboard/dev/system",
    method: "GET",
    permPath: "/dashboard/dev/system",
    min: "read",
  },
  {
    label: "dev database",
    pathname: "/api/dashboard/dev/database",
    method: "GET",
    permPath: "/dashboard/dev/database",
    min: "read",
  },
  {
    label: "bookings list",
    pathname: "/api/bookings",
    method: "GET",
    permPath: "/dashboard",
    min: "read",
  },
  {
    label: "booking folio",
    pathname: "/api/bookings/JH-2026-001",
    method: "GET",
    permPath: "/dashboard/bookings",
    min: "read",
  },
  {
    label: "housekeeping status",
    pathname: "/api/bookings/JH-2026-001",
    method: "PATCH",
    permPath: "/dashboard/housekeeping",
    min: "write",
  },
  {
    label: "gridfs media",
    pathname: "/api/media/6a3a23682bc8769215b6eb53",
    method: "GET",
    permPath: "/dashboard/settings/villas",
    min: "read",
  },
];
