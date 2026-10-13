import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import type { Role } from "./permissions";

export type LiveSessionUser = {
  id: string;
  role: Role;
  status: "active" | "suspended";
  sessionVersion: number;
};

/** Re-read user from MongoDB — source of truth for session validity. */
export async function loadLiveSessionUser(
  userId: string,
): Promise<LiveSessionUser | null> {
  await connectDB();
  const user = await UserModel.findOne({
    _id: userId,
    isDeleted: false,
  }).lean<{
    _id: unknown;
    role: Role;
    status: "active" | "suspended";
    sessionVersion?: number;
  }>();

  if (!user) return null;

  return {
    id: String(user._id),
    role: user.role,
    status: user.status,
    sessionVersion: user.sessionVersion ?? 0,
  };
}
