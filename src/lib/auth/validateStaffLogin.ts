import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { auditLog } from "@/lib/audit/auditLog";
import type { Role } from "./permissions";
import { persistentRateLimit } from "@/lib/rateLimit/persistentRateLimit";
import {
  LOGIN_FAILURE_MESSAGES,
  type LoginFailureCode,
} from "./loginMessages";

export type { LoginFailureCode } from "./loginMessages";
export { LOGIN_FAILURE_CODES, LOGIN_FAILURE_MESSAGES } from "./loginMessages";

const VALID_ROLES: Role[] = ["admin", "staff", "team", "seo", "dev"];

export type StaffLoginSuccess = {
  ok: true;
  userId: string;
  email: string;
  name: string;
  role: Role;
};

export type StaffLoginFailure = {
  ok: false;
  code: LoginFailureCode;
  message: string;
};

export type StaffLoginResult = StaffLoginSuccess | StaffLoginFailure;

export async function validateStaffLogin(input: {
  email: string;
  password: string;
  role?: string;
  audit?: boolean;
}): Promise<StaffLoginResult> {
  const email = input.email.toLowerCase().trim();
  const selectedRole = input.role?.trim() as Role | undefined;
  const audit = input.audit !== false;

  if (!email || !input.password) {
    return fail("INVALID_CREDENTIALS", audit, { email, reason: "missing_fields" });
  }

  const rl = await persistentRateLimit({
    key: `auth:login:${email}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return fail("RATE_LIMITED", audit, { email, reason: "rate_limited" });
  }

  await connectDB();
  const user = await UserModel.findOne({ email, isDeleted: false });
  if (!user) {
    return fail("INVALID_CREDENTIALS", audit, {
      email,
      reason: "invalid_credentials",
    });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    return fail("INVALID_CREDENTIALS", audit, {
      email,
      targetId: String(user._id),
      reason: "invalid_credentials",
    });
  }

  if (user.status === "suspended") {
    return fail("ACCOUNT_SUSPENDED", audit, {
      email,
      targetId: String(user._id),
      reason: "account_suspended",
    });
  }

  if (
    selectedRole &&
    VALID_ROLES.includes(selectedRole) &&
    user.role !== selectedRole
  ) {
    return fail("ROLE_MISMATCH", audit, {
      email,
      targetId: String(user._id),
      reason: "role_mismatch",
      selectedRole,
    });
  }

  return {
    ok: true,
    userId: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
}

export async function recordStaffLoginSuccess(userId: string): Promise<void> {
  await connectDB();
  await UserModel.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } },
  );
  await auditLog({
    action: "login.success",
    targetType: "user",
    targetId: userId,
    userId,
  });
}

function fail(
  code: LoginFailureCode,
  audit: boolean,
  meta: {
    email: string;
    targetId?: string;
    reason: string;
    selectedRole?: string;
  },
): StaffLoginFailure {
  if (audit) {
    void auditLog({
      action: "login.failed",
      targetType: "user",
      targetId: meta.targetId,
      metadata: {
        email: meta.email,
        reason: meta.reason,
        code,
        ...(meta.selectedRole ? { selectedRole: meta.selectedRole } : {}),
      },
    });
  }
  return {
    ok: false,
    code,
    message: LOGIN_FAILURE_MESSAGES[code],
  };
}
