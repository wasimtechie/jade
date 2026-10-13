import { describe, expect, it } from "vitest";
import {
  canAccess,
  defaultDashboardHome,
  resolveApiPermission,
  resolvePermissionPath,
  resolvePostLoginPath,
  roleCanWrite,
  roleMeetsAccess,
} from "./permissions";

describe("RBAC permissions matrix", () => {
  it("matches the longest route prefix, not the first", () => {
    // Regression: previously /dashboard matched first and leaked write to staff.
    expect(canAccess("/dashboard/dev/logs/webhooks", "staff")).toBe("none");
    expect(canAccess("/dashboard/dev/logs/webhooks", "dev")).toBe("write");
    expect(canAccess("/dashboard/dev/logs/errors", "admin")).toBe("read");
  });

  it("denies dev tools to admin (admin is read-only on dev logs, none on dev root)", () => {
    expect(canAccess("/dashboard/dev", "admin")).toBe("none");
    expect(canAccess("/dashboard/dev/system", "admin")).toBe("none");
  });

  it("restricts user management to admin (write) and dev (read)", () => {
    expect(canAccess("/dashboard/staff", "admin")).toBe("write");
    expect(canAccess("/dashboard/staff", "dev")).toBe("read");
    expect(canAccess("/dashboard/staff", "staff")).toBe("none");
    expect(canAccess("/dashboard/staff/roles", "staff")).toBe("none");
    expect(canAccess("/dashboard/staff/roles", "admin")).toBe("write");
  });

  it("defaults unknown routes to deny (no implicit admin grant)", () => {
    expect(canAccess("/dashboard/secret-unmapped", "admin")).toBe("none");
    expect(canAccess("/dashboard/secret-unmapped", "dev")).toBe("none");
  });

  it("handles trailing slashes", () => {
    expect(canAccess("/dashboard/payments/", "admin")).toBe("write");
    expect(roleCanWrite("/dashboard/payments", "staff")).toBe(false);
  });

  it("denies calendar to seo and routes them to seo blogs", () => {
    expect(canAccess("/dashboard", "seo")).toBe("none");
    expect(defaultDashboardHome("seo")).toBe("/dashboard/seo/blogs");
    expect(resolvePostLoginPath("seo", "/dashboard")).toBe("/dashboard/seo/blogs");
  });

  it("keeps admin on calendar after login", () => {
    expect(resolvePostLoginPath("admin", "/dashboard")).toBe("/dashboard");
    expect(defaultDashboardHome("admin")).toBe("/dashboard");
  });

  it("maps API calendar to dashboard calendar permission", () => {
    expect(resolvePermissionPath("/dashboard/calendar")).toBe("/dashboard");
    expect(resolveApiPermission("/api/dashboard/calendar", "GET")).toEqual({
      permPath: "/dashboard",
      min: "read",
    });
    expect(roleMeetsAccess("/dashboard", "team", "read")).toBe(true);
    expect(roleMeetsAccess("/dashboard", "seo", "read")).toBe(false);
  });

  it("maps booking API methods to correct modules", () => {
    expect(resolveApiPermission("/api/bookings", "GET")).toEqual({
      permPath: "/dashboard",
      min: "read",
    });
    expect(resolveApiPermission("/api/bookings/JH-1", "PATCH")).toEqual({
      permPath: "/dashboard/housekeeping",
      min: "write",
    });
    expect(resolveApiPermission("/api/bookings", "POST")).toBeNull();
  });

  it("requires write for dashboard POST APIs", () => {
    const perm = resolveApiPermission("/api/dashboard/blocks", "POST");
    expect(perm).toEqual({ permPath: "/dashboard/blocks", min: "write" });
    expect(roleMeetsAccess("/dashboard/blocks", "staff", "write")).toBe(true);
    expect(roleMeetsAccess("/dashboard/blocks", "team", "write")).toBe(false);
  });

  it("maps user management API to /dashboard/staff (admin write)", () => {
    expect(resolvePermissionPath("/dashboard/users")).toBe("/dashboard/staff");
    expect(resolveApiPermission("/api/dashboard/users", "GET")).toEqual({
      permPath: "/dashboard/staff",
      min: "read",
    });
    expect(roleMeetsAccess("/dashboard/staff", "admin", "read")).toBe(true);
    expect(roleMeetsAccess("/dashboard/staff", "admin", "write")).toBe(true);
    expect(roleMeetsAccess("/dashboard/staff", "staff", "read")).toBe(false);
  });

  it("maps villas API with all=1 to settings, otherwise calendar", () => {
    expect(
      resolveApiPermission("/api/dashboard/villas", "GET", "?all=1"),
    ).toEqual({ permPath: "/dashboard/settings/villas", min: "read" });
    expect(resolveApiPermission("/api/dashboard/villas", "GET")).toEqual({
      permPath: "/dashboard",
      min: "read",
    });
    expect(roleMeetsAccess("/dashboard", "team", "read")).toBe(true);
    expect(
      roleMeetsAccess("/dashboard/settings/villas", "team", "read"),
    ).toBe(false);
  });

  it("maps content API to seo module", () => {
    expect(resolveApiPermission("/api/dashboard/content", "GET")).toEqual({
      permPath: "/dashboard/seo",
      min: "read",
    });
    expect(roleMeetsAccess("/dashboard/seo", "seo", "read")).toBe(true);
    expect(roleMeetsAccess("/dashboard/seo", "admin", "write")).toBe(true);
  });

  it("maps dashboard folio cancel/refund to bookings write (not housekeeping)", () => {
    expect(
      resolveApiPermission("/api/dashboard/bookings/JH-2026-001", "PATCH"),
    ).toEqual({ permPath: "/dashboard/bookings", min: "write" });
    expect(roleMeetsAccess("/dashboard/bookings", "staff", "write")).toBe(true);
    expect(roleMeetsAccess("/dashboard/bookings", "team", "write")).toBe(false);
    expect(roleMeetsAccess("/dashboard/bookings", "team", "read")).toBe(true);
  });

  it("maps booking records list GET to bookings read", () => {
    expect(resolveApiPermission("/api/dashboard/bookings", "GET")).toEqual({
      permPath: "/dashboard/bookings",
      min: "read",
    });
    expect(roleMeetsAccess("/dashboard/bookings", "team", "read")).toBe(true);
  });

  it("maps public booking PATCH to housekeeping only (stayStatus)", () => {
    expect(resolveApiPermission("/api/bookings/JH-2026-001", "PATCH")).toEqual({
      permPath: "/dashboard/housekeeping",
      min: "write",
    });
    expect(roleMeetsAccess("/dashboard/housekeeping", "team", "write")).toBe(
      true,
    );
    expect(roleMeetsAccess("/dashboard/housekeeping", "staff", "write")).toBe(
      true,
    );
  });

  it("maps manual booking POST to bookings write", () => {
    expect(resolveApiPermission("/api/dashboard/bookings", "POST")).toEqual({
      permPath: "/dashboard/bookings",
      min: "write",
    });
  });
});
