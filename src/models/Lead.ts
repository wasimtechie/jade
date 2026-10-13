import { Schema, model, models } from "mongoose";
import { LEAD_SOURCES } from "@/lib/leads/sourceLabels";

const LeadSchema = new Schema(
  {
    source: {
      type: String,
      enum: LEAD_SOURCES,
      required: true,
    },
    payload: { type: Schema.Types.Mixed, default: {} },
    email: String,
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    staffNotes: { type: String, default: "" },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ status: 1, createdAt: -1 });

export const LeadModel = models.Lead ?? model("Lead", LeadSchema);
