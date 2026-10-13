import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { auditLog } from "@/lib/audit/auditLog";
import { UserModel } from "@/models/User";
import {
  createUserSchema,
  publicUser,
} from "@/lib/auth/userManagement";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

/** List all staff accounts (admin write, dev read). */
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/staff", "read");
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const users = await UserModel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      { users: users.map((u) => publicUser(u as never)) },
      { headers: noStore },
    );
  } catch (e) {
    console.error("[GET /api/dashboard/users]", e);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500, headers: noStore },
    );
  }
}

/** Create a new staff account (admin only). */
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/staff", "write");
  if (!auth.ok) return auth.response;

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

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: noStore },
    );
  }

  const { name, email, password, role, assignedVillas } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    await connectDB();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.isDeleted) {
        await UserModel.deleteOne({ _id: existing._id });
      } else {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409, headers: noStore },
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      status: "active",
      assignedVillas: assignedVillas ?? [],
      createdBy: auth.userId,
      updatedBy: auth.userId,
    });

    await auditLog({
      action: "user.create",
      targetType: "user",
      targetId: String(user._id),
      userId: auth.userId,
      metadata: { role, email: normalizedEmail },
    });

    return NextResponse.json(
      { user: publicUser(user as never) },
      { status: 201, headers: noStore },
    );
  } catch (e) {
    console.error("[POST /api/dashboard/users]", e);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500, headers: noStore },
    );
  }
}
