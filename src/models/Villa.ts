import { Schema, model, models, type InferSchemaType } from "mongoose";
import { AxisRoomsSchema, VillaContentSchema } from "./VillaContent";

const WeddingTierSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    mode: { type: String, enum: ["half_day", "full_day"], required: true },
    maxGuests: { type: Number, required: true },
    pricePaise: { type: Number, required: true },
    stayIncludedPax: { type: Number, default: 0 },
  },
  { _id: false },
);

const VillaSettingsSchema = new Schema(
  {
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "11:00" },
    securityDepositPaise: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    cleaningFeePaise: { type: Number, default: 0 },
    cancellationPolicy: { type: String, default: "[TO BE CONFIRMED]" },
  },
  { _id: false },
);

const VillaSchema = new Schema(
  {
    slug: { type: String, required: true },
    retreatId: { type: String },
    shortName: { type: String },
    type: { type: String },
    location: { type: String },
    thumbnail: { type: String },
    portfolioSource: {
      type: String,
      enum: ["canonical", "legacy", "coming_soon", "custom"],
    },
    displayStats: {
      stay: String,
      events: String,
      bhk: String,
      lawn: String,
      villaArea: String,
      pool: String,
    },
    notes: { type: String, default: "" },
    name: { type: String, required: true },
    basePricePaise: { type: Number, required: true },
    dayOutBasePricePaise: { type: Number, required: true },
    stayBasePax: { type: Number, required: true },
    dayOutBasePax: { type: Number, required: true },
    stayMaxPax: { type: Number, required: true },
    extraPaxStayPaise: { type: Number, default: 200000 },
    extraPaxDayOutPaise: { type: Number, default: 100000 },
    weddingVenue: { type: Boolean, default: false },
    weddingTiers: [WeddingTierSchema],
    settings: { type: VillaSettingsSchema, required: true },
    addOnAvailability: [String],
    depositPercent: { type: Number, default: 0 },
    depositPaise: { type: Number },
    /** Axis Rooms channel manager mapping. */
    axisRooms: { type: AxisRoomsSchema, default: undefined },
    /** OTA sync mode — website_only skips Axis outbound; channel_managed requires mapping. */
    channelMode: {
      type: String,
      enum: ["website_only", "channel_managed"],
      default: "website_only",
    },
    /** Marketing + detail-page content (drives public /retreat/[id]). */
    content: { type: VillaContentSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["active", "maintenance", "hidden"],
      default: "active",
    },
    bookable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

VillaSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
VillaSchema.index(
  { retreatId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      retreatId: { $type: "string" },
    },
  },
);

export type VillaDoc = InferSchemaType<typeof VillaSchema>;
export const VillaModel = models.Villa ?? model("Villa", VillaSchema);
