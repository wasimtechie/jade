import mongoose, { Schema, model, models } from "mongoose";

const MediaVariantSchema = new Schema(
  {
    label: String,
    gridFsId: String,
    url: String,
    width: Number,
    height: Number,
    mime: String,
    size: Number,
  },
  { _id: false },
);

const MediaAssetSchema = new Schema(
  {
    storage: {
      type: String,
      enum: ["gridfs", "static"],
      required: true,
    },
    gridFsId: String,
    bucket: { type: String, default: "cms-media" },
    publicUrl: { type: String, required: true, index: true },
    originalFilename: String,
    filename: String,
    mime: String,
    size: Number,
    width: Number,
    height: Number,
    folderSlug: { type: String, default: "general-assets", index: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    tags: { type: [String], default: [] },
    variants: [MediaVariantSchema],
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      index: true,
    },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

MediaAssetSchema.index({ status: 1, folderSlug: 1, createdAt: -1 });
MediaAssetSchema.index({ tags: 1 });
MediaAssetSchema.index(
  { originalFilename: "text", alt: "text", caption: "text", tags: "text" },
  { name: "media_search" },
);

export const MediaAssetModel =
  models.MediaAsset ?? model("MediaAsset", MediaAssetSchema);
