import { connectDB } from "@/lib/db";
import { SeoSiteSettingsModel } from "@/models/SeoSiteSettings";

/** Lightweight SEO settings read — no audit/blog/DOMPurify imports (safe for serverless cold start). */
export async function getSeoSiteSettings() {
  await connectDB();
  const existing = await SeoSiteSettingsModel.findOne({ key: "default" }).lean();
  if (existing) return existing;
  const created = await SeoSiteSettingsModel.create({ key: "default" });
  return created.toObject();
}
