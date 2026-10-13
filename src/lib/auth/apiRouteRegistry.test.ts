import { describe, expect, it } from "vitest";
import { DASHBOARD_NAV } from "@/components/dashboard/navConfig";
import {
  API_ROUTE_CASES,
  resolveApiPermission,
} from "@/lib/auth/apiRouteRegistry";
import {
  ALL_ROLES,
  canAccess,
  isRegisteredPermissionPath,
  resolvePermissionPath,
  roleMeetsAccess,
  ROUTE_MATRIX,
  type Role,
} from "@/lib/auth/permissions";

describe("API route registry parity", () => {
  it.each(API_ROUTE_CASES)(
    "$label — $method $pathname maps to $permPath ($min)",
    ({ pathname, method, search, permPath, min }) => {
      const resolved = resolveApiPermission(pathname, method, search ?? "");
      expect(resolved).toEqual({ permPath, min });
      expect(isRegisteredPermissionPath(permPath)).toBe(true);
    },
  );

  it("never maps staff APIs to unregistered matrix paths", () => {
    for (const c of API_ROUTE_CASES) {
      const resolved = resolveApiPermission(
        c.pathname,
        c.method,
        c.search ?? "",
      );
      expect(resolved).not.toBeNull();
      expect(isRegisteredPermissionPath(resolved!.permPath)).toBe(true);
    }
  });

  it("admin can access user management API (regression)", () => {
    const perm = resolveApiPermission("/api/dashboard/users", "GET");
    expect(perm).toEqual({ permPath: "/dashboard/staff", min: "read" });
    expect(roleMeetsAccess(perm!.permPath, "admin", perm!.min)).toBe(true);
    expect(roleMeetsAccess(perm!.permPath, "staff", perm!.min)).toBe(false);
  });
});

describe("Dashboard nav vs permission matrix", () => {
  it("every nav item resolves to a registered matrix path", () => {
    for (const item of DASHBOARD_NAV) {
      const permPath = resolvePermissionPath(item.href);
      expect(
        isRegisteredPermissionPath(permPath),
        `${item.href} → ${permPath}`,
      ).toBe(true);
    }
  });

  it("each nav item is visible to at least one role in the matrix", () => {
    for (const item of DASHBOARD_NAV) {
      const permPath = resolvePermissionPath(item.href);
      const entry = ROUTE_MATRIX.find((e) => e.path === permPath);
      expect(entry).toBeDefined();
      const visible = ALL_ROLES.some(
        (role) => (entry!.perms[role] ?? "none") !== "none",
      );
      expect(visible, item.href).toBe(true);
    }
  });
});

describe("Role access smoke tests", () => {
  const cases: Array<{
    role: Role;
    path: string;
    read: boolean;
    write: boolean;
  }> = [
    { role: "admin", path: "/dashboard/staff", read: true, write: true },
    { role: "dev", path: "/dashboard/staff", read: true, write: false },
    { role: "staff", path: "/dashboard/staff", read: false, write: false },
    { role: "seo", path: "/dashboard/seo/blogs", read: true, write: true },
    { role: "seo", path: "/dashboard", read: false, write: false },
    { role: "team", path: "/dashboard", read: true, write: false },
    { role: "dev", path: "/dashboard/dev/logs/api", read: true, write: true },
    { role: "admin", path: "/dashboard/dev/logs/errors", read: true, write: false },
  ];

  it.each(cases)("$role on $path", ({ role, path, read, write }) => {
    const level = canAccess(path, role);
    if (read) {
      expect(level === "read" || level === "write").toBe(true);
    } else {
      expect(level).toBe("none");
    }
    expect(roleMeetsAccess(path, role, "write")).toBe(write);
  });
});
