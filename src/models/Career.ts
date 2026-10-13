import { Schema, model, models } from "mongoose";

const CareerSchema = new Schema(
  {
    jobId: String,
    jobTitle: String,
    sourcePage: String,
    applyContext: String,
    clientPath: String,
    fullName: String,
    email: String,
    phone: String,
    company: String,
    resume: {
      filename: String,
      mime: String,
      size: Number,
      gridFsId: String,
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "shortlisted", "rejected", "hired"],
      default: "new",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

CareerSchema.index({ jobId: 1, createdAt: -1 });
CareerSchema.index({ status: 1, createdAt: -1 });

export const CareerModel = models.Career ?? model("Career", CareerSchema);
