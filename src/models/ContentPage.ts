import mongoose, { Schema, model, models } from "mongoose";

/** Re-register in dev so new section fields (e.g. rawHtml) are not dropped on hot reload. */
if (process.env.NODE_ENV !== "production" && models.ContentPage) {
  delete mongoose.models.ContentPage;
}

const ContentSectionSchema = new Schema(
  {
    sectionKey: String,
    slotId: String,
    landingKind: {
      type: String,
      enum: ["hero", "native", "rich-text", "divider"],
    },
    enabled: { type: Boolean, default: true },
    type: {
      type: String,
      enum: [
        "text",
        "heading",
        "image",
        "quote",
        "list",
        "table",
        "faq",
        "cta",
        "html",
        "gallery",
        "button",
        "video",
        "callout",
        "divider",
      ],
    },
    rawHtml: String,
    settings: Schema.Types.Mixed,
    heading: String,
    body: String,
    content: String,
    image: String,
    caption: String,
    level: Number,
    items: [String],
    tableData: {
      headers: [String],
      rows: [[String]],
    },
    faqs: [{ question: String, answer: String }],
    ctas: [{ label: String, link: String, variant: String }],
    imageRef: {
      storage: String,
      key: String,
      alt: String,
      sizes: Schema.Types.Mixed,
    },
    pricePaise: Number,
    ctaLabel: String,
    ctaHref: String,
    seo: {
      title: String,
      description: String,
      ogImageRef: String,
    },
  },
  { _id: false },
);

const ContentPageMetaSchema = new Schema(
  {
    title: String,
    slug: String,
    excerpt: String,
    description: String,
    image: String,
    author: String,
    category: String,
    tags: [String],
    readTime: String,
    isFeatured: Boolean,
    isPinned: Boolean,
    featuredOrder: { type: Number, default: 0 },
    publishedAt: String,
    dateModified: String,
    thumbnailImage: String,
    scheduledAt: String,
    scheduledPublishAt: String,
    internalNotes: String,
    previousSlugs: [String],
    faqs: [{ question: String, answer: String }],
    analytics: {
      views: { type: Number, default: 0 },
      organicTraffic: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      rankingKeywords: [String],
      engagement: { type: Number, default: 0 },
    },
    schemas: {
      article: { type: Boolean, default: true },
      faq: { type: Boolean, default: false },
      howTo: { type: Boolean, default: false },
      breadcrumb: { type: Boolean, default: true },
    },
    seo: {
      metaTitle: String,
      focusKeyword: String,
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
      robotsIndex: { type: Boolean, default: true },
      robotsFollow: { type: Boolean, default: true },
    },
    advancedSchema: {
      type: {
        type: String,
        enum: ["none", "faq", "howto", "article"],
      },
      faqs: [{ question: String, answer: String }],
    },
  },
  { _id: false },
);

const ContentPageSchema = new Schema(
  {
    pageKey: { type: String, required: true, unique: true },
    meta: ContentPageMetaSchema,
    sections: [ContentSectionSchema],
    status: {
      type: String,
      enum: [
        "draft",
        "in_review",
        "approved",
        "scheduled",
        "published",
        "archived",
        "trashed",
      ],
      default: "draft",
    },
    trashedAt: Date,
    internalNotes: String,
    editLock: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      userName: String,
      lockedAt: Date,
      expiresAt: Date,
    },
    versions: [
      {
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        updatedAt: Date,
        action: String,
        snapshot: Schema.Types.Mixed,
      },
    ],
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ContentPageSchema.index({ pageKey: 1, status: 1 });
ContentPageSchema.index({ status: 1, "meta.publishedAt": -1 });
ContentPageSchema.index({ "meta.isFeatured": 1, "meta.featuredOrder": 1 });

export const ContentPageModel =
  models.ContentPage ?? model("ContentPage", ContentPageSchema);
