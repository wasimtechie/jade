import type { MetadataRoute } from "next";
import { getMergedPublishedPosts } from "@/lib/cms/blogStore";
import { resolvePublicVillaList } from "@/lib/villas/resolvePublicVilla";

const BASE = "https://jadehospitainment.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/retreats/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/weddings`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE}/experiences`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/weekend-getaways`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/corporate-retreats`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/party-villas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/caravans`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${BASE}/blogs/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE}/careers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${BASE}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${BASE}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.35,
    },
  ];

  const villas = await resolvePublicVillaList();
  const villaRoutes: MetadataRoute.Sitemap = villas.flatMap((v) => [
    {
      url: `${BASE}/retreat/${v.id}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
    {
      url: `${BASE}/retreat/${v.id}/spaces/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.72,
    },
  ]);

  // Dynamic blog routes (CMS + static)
  const posts = await getMergedPublishedPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/${post.slug}/`,
    lastModified: new Date(post.dateModified ?? post.date),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...villaRoutes, ...blogRoutes];
}
