export const DEFAULT_MEDIA_FOLDERS = [
  { slug: "blog-images", label: "Blog Images", sortOrder: 1 },
  { slug: "villa-images", label: "Villa Images", sortOrder: 2 },
  { slug: "experience-images", label: "Experience Images", sortOrder: 3 },
  { slug: "seo-assets", label: "SEO Assets", sortOrder: 4 },
  { slug: "general-assets", label: "General Assets", sortOrder: 5 },
  { slug: "public-site", label: "Public Site (read-only paths)", sortOrder: 6 },
] as const;

export type DefaultFolderSlug = (typeof DEFAULT_MEDIA_FOLDERS)[number]["slug"];
