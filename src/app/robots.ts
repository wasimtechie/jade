import type { MetadataRoute } from "next";

const DISALLOW = [
  "/book",
  "/book/",
  "/menu",
  "/api/",
  "/admin",
  "/admin/",
  "/wishlist",
  "/wishlist/",
];

/** Explicit AI / search assistants: same crawl policy as default, avoids accidental blanket blocks. */
const AI_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  const baseRule = { allow: "/" as const, disallow: DISALLOW };

  return {
    rules: [
      { userAgent: "*", ...baseRule },
      ...AI_USER_AGENTS.map((userAgent) => ({ userAgent, ...baseRule })),
    ],
    sitemap: "https://jadehospitainment.com/sitemap.xml",
    host: "https://jadehospitainment.com",
  };
}
