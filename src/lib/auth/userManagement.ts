import { z } from "zod";
import { USER_ROLES, USER_STATUSES, UserModel } from "@/models/User";

export const roleSchema = z.enum(USER_ROLES);
export const statusSchema = z.enum(USER_STATUSES);

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  role: roleSchema,
  assignedVillas: z.array(z.string().min(1).max(64)).max(100).optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    role: roleSchema.optional(),
    status: statusSchema.optional(),
    assignedVillas: z.array(z.string().min(1).max(64)).max(100).optional(),
    password: z.string().min(8).max(200).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "No fields to update",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** Count of non-deleted, active admins — used to block last-admin lockout. */
export async function activeAdminCount(excludeId?: string): Promise<number> {
  const query: Record<string, unknown> = {
    role: "admin",
    status: "active",
    isDeleted: false,
  };
  if (excludeId) query._id = { $ne: excludeId };
  return UserModel.countDocuments(query);
}

export function publicUser(doc: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  status: string;
  assignedVillas?: unknown[];
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status ?? "active",
    assignedVillas: (doc.assignedVillas ?? []).map(String),
    lastLoginAt: doc.lastLoginAt ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}
