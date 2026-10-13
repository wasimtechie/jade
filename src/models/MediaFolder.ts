import mongoose, { Schema, model, models } from "mongoose";

const MediaFolderSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    parentSlug: { type: String, default: null },
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MediaFolderModel =
  models.MediaFolder ?? model("MediaFolder", MediaFolderSchema);
