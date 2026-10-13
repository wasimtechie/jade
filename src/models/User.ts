import { Schema, model, models } from "mongoose";

export const USER_ROLES = ["admin", "staff", "team", "seo", "dev"] as const;
export const USER_STATUSES = ["active", "suspended"] as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "active",
    },
    assignedVillas: [{ type: Schema.Types.ObjectId, ref: "Villa" }],
    lastLoginAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    /** Bumped on suspend, role change, or password reset — invalidates JWTs. */
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const UserModel = models.User ?? model("User", UserSchema);
