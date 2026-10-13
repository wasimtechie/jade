import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "./permissions";
import { canAccess } from "./permissions";
import { connectDB, mongoose } from "@/lib/db";
import { UserModel } from "@/models/User";

export type RequireRoleSuccess = {
  ok: true;
  role: Role;
  userId: string;
  name: string;
  email: string;
  assignedVillas: string[];
};

type RequireRoleFailure = { ok: false; response: NextResponse };

const noStore = { "Cache-Control": "no-store" } as const;

/**
 * Authoritative server-side RBAC guard.
 *
 * - Requires a valid NextAuth session (no header/password bypass).
 * - Re-reads the user from MongoDB on every call (source of truth), so a
 *   revoked/suspended/deleted account is denied immediately, not at token expiry.
 * - Enforces the route permission matrix at the requested access level.
 */
export async function requireRole(
  req: NextRequest,
  path: string,
  min: "read" | "write" = "write",
): Promise<RequireRoleSuccess | RequireRoleFailure> {
  let token;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch (e) {
    console.error("[requireRole] getToken failed", e);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authorization check failed", code: "AUTH_CHECK_FAILED" },
        { status: 503, headers: noStore },
      ),
    };
  }

  const sessionUserId =
    typeof token?.uid === "string" ? token.uid : undefined;

  if (!sessionUserId || token?.active === false) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          code:
            token?.active === false ? "ACCOUNT_SUSPENDED" : "UNAUTHENTICATED",
        },
        { status: 401, headers: noStore },
      ),
    };
  }

  if (!mongoose.Types.ObjectId.isValid(sessionUserId)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid session", code: "INVALID_SESSION" },
        { status: 401, headers: noStore },
      ),
    };
  }

  let user;
  try {
    await connectDB();
    user = await UserModel.findOne({
      _id: sessionUserId,
      isDeleted: false,
    }).lean<{
      _id: unknown;
      name: string;
      email: string;
      role: Role;
      status: string;
      assignedVillas?: unknown[];
    }>();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authorization check failed" },
        { status: 503, headers: noStore },
      ),
    };
  }

  if (!user || user.status === "suspended") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Account is no longer active",
          code: "ACCOUNT_SUSPENDED",
        },
        { status: 401, headers: noStore },
      ),
    };
  }

  const role = user.role;
  const level = canAccess(path, role);
  const allowed =
    min === "write" ? level === "write" : level === "read" || level === "write";

  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403, headers: noStore },
      ),
    };
  }

  return {
    ok: true,
    role,
    userId: String(user._id),
    name: user.name,
    email: user.email,
    assignedVillas: (user.assignedVillas ?? []).map(String),
  };
}
