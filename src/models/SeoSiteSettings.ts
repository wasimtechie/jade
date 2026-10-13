import mongoose, { Schema, model, models } from "mongoose";

const SeoSiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true },
    robotsTxtOverride: { type: String, default: null },
    sitemapLastGeneratedAt: Date,
    sitemapUrlCount: { type: Number, default: 0 },
    /** Future Search Console / Analytics / GTM — not wired yet. */
    integrations: {
      googleSearchConsole: {
        connected: { type: Boolean, default: false },
        propertyUrl: String,
        lastSyncAt: Date,
      },
      googleAnalytics: {
        measurementId: String,
        connected: { type: Boolean, default: false },
      },
      googleTagManager: {
        containerId: String,
        connected: { type: Boolean, default: false },
      },
    },
    internalLinking: {
      enabled: { type: Boolean, default: false },
      lowLinkThreshold: { type: Number, default: 2 },
    },
  },
  { timestamps: true },
);

export const SeoSiteSettingsModel =
  models.SeoSiteSettings ?? model("SeoSiteSettings", SeoSiteSettingsSchema);
