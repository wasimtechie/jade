import { Schema, model, models } from "mongoose";

const PartnerLeadSchema = new Schema(
  {
    email: String,
    payload: { type: Schema.Types.Mixed, default: {} },
    photos: [
      {
        ordinal: Number,
        filename: String,
        mime: String,
        size: Number,
        gridFsId: String,
      },
    ],
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

PartnerLeadSchema.index({ status: 1, createdAt: -1 });

export const PartnerLeadModel =
  models.PartnerLead ?? model("PartnerLead", PartnerLeadSchema);
