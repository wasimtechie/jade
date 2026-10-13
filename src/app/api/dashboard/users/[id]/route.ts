import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { auditLog } from "@/lib/audit/auditLog";
import { UserModel } from "@/models/User";
import {
  activeAdminCount,
  publicUser,
  updateUserSchema,
} from "@/lib/auth/userManagement";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

function badId() {
  return NextResponse.json(
    { error: "Invalid user id" },
    { status: 400, headers: noStore },
  );
}

/** User details (admin write, dev read). */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/staff", "read");
  if (!auth.ok) return auth.response;
  if (!OBJECT_ID.test(params.id)) return badId();

  try {
    await connectDB();
    const user = await UserModel.findOne({
      _id: params.id,
      isDeleted: false,
    }).lean();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: noStore },
      );
    }
    return NextResponse.json(
      { user: publicUser(user as never) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/users/[id]]", e);
    return NextResponse.json(
      { error: "Failed to load user" },
      { status: 500, headers: noStore },
    );
  }
}

/** Edit user: name, role, status (suspend/activate), assigned villas, reset password. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/staff", "write");
  if (!auth.ok) return auth.response;
  if (!OBJECT_ID.test(params.id)) return badId();

  let body: unknown;
  try {
    body = await req.json();
    assertPlainObject(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: noStore },
    );
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const isSelf = params.id === auth.userId;
  const changes = parsed.data;

  try {
    await connectDB();
    const user = await UserModel.findOne({ _id: params.id, isDeleted: false });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: noStore },
      );
    }

    const demotingFromAdmin =
      user.role === "admin" &&
      ((changes.role && changes.role !== "admin") ||
        changes.status === "suspended");

    if (demotingFromAdmin) {
      const admins = await activeAdminCount(params.id);
      if (admins === 0) {
        return NextResponse.json(
          { error: "Cannot demote or suspend the last active admin" },
          { status: 409, headers: noStore },
        );
      }
    }

    if (isSelf && changes.role && changes.role !== user.role) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 409, headers: noStore },
      );
    }
    if (isSelf && changes.status === "suspended") {
      return NextResponse.json(
        { error: "You cannot suspend your own account" },
        { status: 409, headers: noStore },
      );
    }

    const applied: Record<string, unknown> = {};
    let bumpSession = false;
    if (changes.name !== undefined) {
      user.name = changes.name;
      applied.name = changes.name;
    }
    if (changes.role !== undefined) {
      user.role = changes.role;
      applied.role = changes.role;
      bumpSession = true;
    }
    if (changes.status !== undefined) {
      user.status = changes.status;
      applied.status = changes.status;
      bumpSession = true;
    }
    if (changes.assignedVillas !== undefined) {
      user.assignedVillas = changes.assignedVillas as never;
      applied.assignedVillas = changes.assignedVillas.length;
    }
    if (changes.password !== undefined) {
      user.passwordHash = await bcrypt.hash(changes.password, 12);
      applied.passwordReset = true;
      bumpSession = true;
    }
    if (bumpSession) {
      user.sessionVersion = (user.sessionVersion ?? 0) + 1;
      applied.sessionVersion = user.sessionVersion;
    }
    user.updatedBy = auth.userId as never;
    await user.save();

    await auditLog({
      action: "user.update",
      targetType: "user",
      targetId: params.id,
      userId: auth.userId,
      metadata: applied,
    });

    return NextResponse.json(
      { user: publicUser(user as never) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[PATCH /api/dashboard/users/[id]]", e);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500, headers: noStore },
    );
  }
}

/** Permanently remove a user (admin only). Audit log retains a snapshot. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(req, "/dashboard/staff", "write");
  if (!auth.ok) return auth.response;
  if (!OBJECT_ID.test(params.id)) return badId();

  if (params.id === auth.userId) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 409, headers: noStore },
    );
  }

  try {
    await connectDB();
    const user = await UserModel.findOne({ _id: params.id, isDeleted: false });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: noStore },
      );
    }

    if (user.role === "admin") {
      const admins = await activeAdminCount(params.id);
      if (admins === 0) {
        return NextResponse.json(
          { error: "Cannot delete the last active admin" },
          { status: 409, headers: noStore },
        );
      }
    }

    const snapshot = {
      email: user.email,
      role: user.role,
      name: user.name,
    };

    await UserModel.deleteOne({ _id: params.id });

    await auditLog({
      action: "user.delete",
      targetType: "user",
      targetId: params.id,
      userId: auth.userId,
      metadata: snapshot,
    });

    return NextResponse.json({ ok: true, deleted: true }, { headers: noStore });
  } catch (e) {
    console.error("[DELETE /api/dashboard/users/[id]]", e);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500, headers: noStore },
    );
  }
}
