import { NextRequest, NextResponse } from "next/server";
import {
  LOGIN_FAILURE_MESSAGES,
  type LoginFailureCode,
} from "@/lib/auth/loginMessages";
import { validateStaffLogin } from "@/lib/auth/validateStaffLogin";
import { assertPlainObject } from "@/lib/security/validateInput";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

/**
 * Pre-flight login check — returns specific failure reasons (suspended, role, etc.)
 * without creating a session. Used by the login page before NextAuth signIn.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const raw = await req.json();
    assertPlainObject(raw);
    body = raw;
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_CREDENTIALS", message: "Invalid payload" },
      { status: 400, headers: noStore },
    );
  }

  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  const role = body.role != null ? String(body.role) : undefined;

  const result = await validateStaffLogin({ email, password, role });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: result.code as LoginFailureCode,
        message: result.message,
      },
      { status: 401, headers: noStore },
    );
  }

  return NextResponse.json({ ok: true }, { headers: noStore });
}
