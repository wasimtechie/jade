/** One-time, insert-only WXR -> existing ContentPage CMS migration. */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import DOMPurify from "isomorphic-dompurify";
import sharp from "sharp";
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const filename = args.find((arg) => !arg.startsWith("--"));
if (!filename) {
  console.error("Usage: node scripts/import-wordpress-blogs.mjs export.xml [--apply] [--download-media]");
  process.exit(1);
}
const apply = args.includes("--apply");
const downloadMedia = apply || args.includes("--download-media");
const output = path.join(root, "tmp/wordpress-migration");
await fs.mkdir(output, { recursive: true });
const source = JSON.parse(execFileSync("python3", [path.join(root, "scripts/read-wordpress-export.py"), filename], {
  maxBuffer: 100 * 1024 * 1024,
}));
const site = new URL(source.site);
const siteHosts = new Set([site.hostname, `www.${site.hostname.replace(/^www\./, "")}`]);
const window = new JSDOM("").window;
const document = window.document;
const plain = (html) => {
  const node = document.createElement("div");
  node.innerHTML = html || "";
  node.querySelectorAll("style,script").forEach((el) => el.remove());
  return node.textContent.replace(/\s+/g, " ").trim();
};
const normalizePath = (p) => p.replace(/\/+$/, "") || "/";
const postPaths = new Map();
const knownPages = new Map(Object.entries({
  "/contact": "/contact", "/about": "/about", "/blog": "/blogs/", "/blogs": "/blogs/",
  "/": "/", "/weddings": "/weddings", "/corporate-retreats": "/corporate-retreats",
  "/weekend-getaways": "/weekend-getaways", "/party-villas": "/party-villas",
}));
const reservedSlugs = new Set((await fs.readdir(path.join(root, "src/app"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("[")).map((entry) => entry.name));
for (const post of source.posts) {
  if (!post.slug || /[/?#]/.test(post.slug)) throw new Error(`Invalid slug on WordPress post ${post.id}`);
  if (reservedSlugs.has(post.slug.toLowerCase())) throw new Error(`Post slug conflicts with application route: ${post.slug}`);
  const oldPath = normalizePath(new URL(post.url, site).pathname);
  if (postPaths.has(oldPath)) throw new Error(`Duplicate original URL: ${oldPath}`);
  postPaths.set(oldPath, `/${post.slug.toLowerCase()}/`);
}
const media = new Map();
const unknownLinks = new Map();
const report = { sourceSite: source.site, sourceFile: path.basename(filename), importedAt: new Date().toISOString(),
  totalPosts: source.posts.length, posts: [], media: [], unknownInternalLinks: [], conflicts: [], redirects: [] };

function mediaKey(raw) {
  try {
    const url = new URL(raw, site);
    if (!siteHosts.has(url.hostname) || !url.pathname.startsWith("/wp-content/uploads/")) return null;
    url.protocol = "https:";
    url.hostname = site.hostname;
    url.search = "";
    url.hash = "";
    return url.href;
  } catch { return null; }
}
function registerMedia(raw, postId) {
  const key = mediaKey(raw);
  if (!key) return raw || "";
  if (!media.has(key)) {
    const name = path.basename(new URL(key).pathname).replace(/[^a-zA-Z0-9_.-]/g, "-").slice(-90);
    const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
    media.set(key, { source: key, originalLocal: new URL(key).pathname,
      local: `/blog-media/wordpress/${hash}-${name}.webp`, postIds: [], status: "pending" });
  }
  const item = media.get(key);
  if (!item.postIds.includes(postId)) item.postIds.push(postId);
  return key;
}
function convertLink(raw, postId) {
  if (!raw || raw.startsWith("#")) return raw;
  try {
    const url = new URL(raw, site);
    if (!siteHosts.has(url.hostname)) return raw;
    const p = normalizePath(url.pathname);
    const target = postPaths.get(p) || knownPages.get(p);
    if (target) return `${target}${url.search}${url.hash}`;
    if (p.startsWith("/wp-content/uploads/")) return registerMedia(url.href, postId);
    if (!unknownLinks.has(p)) unknownLinks.set(p, new Set());
    unknownLinks.get(p).add(postId);
    // Preserve unresolved links for the report rather than guessing a destination.
    return url.href.replace(/^http:/, "https:");
  } catch { return raw; }
}
function prepareBody(post) {
  const body = document.createElement("div");
  let content = post.content.trim() || post.fallbackContent;
  content = content.replace(/<!--\s*\/?wp:[\s\S]*?-->/g, "")
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, "<figure>$1</figure>")
    .replace(/\[gallery[^\]]*ids=["']([^"']+)["'][^\]]*\]/gi, (_, ids) =>
      ids.split(",").map((id) => {
        const a = source.attachments[id.trim()];
        return a ? `<img src="${a.url.replace(/"/g, "&quot;")}" alt="${plain(a.alt).replace(/"/g, "&quot;")}">` : "";
      }).join("\n"));
  if (!/<(?:p|h[1-6]|div|table|ul|ol|figure)\b/i.test(content)) {
    content = content.split(/\n\s*\n/).map((part) => `<p>${part}</p>`).join("\n");
  }
  body.innerHTML = content;
  body.querySelectorAll("style,script,link,meta,form,input,button,nav").forEach((el) => el.remove());
  for (const heading of body.querySelectorAll("h1")) {
    const replacement = document.createElement("h2");
    replacement.innerHTML = heading.innerHTML;
    if (heading.id) replacement.id = heading.id;
    heading.replaceWith(replacement);
  }
  for (const el of body.querySelectorAll("*")) {
    el.removeAttribute("style");
    el.removeAttribute("class");
    if (el.tagName === "IMG") {
      const src = el.getAttribute("data-src") || el.getAttribute("src");
      if (src) el.setAttribute("src", registerMedia(src, post.id));
      el.removeAttribute("srcset");
      el.removeAttribute("sizes");
      el.setAttribute("loading", "lazy");
      el.setAttribute("decoding", "async");
      if (!el.getAttribute("alt")) {
        const attachment = Object.values(source.attachments).find((a) => mediaKey(a.url) === mediaKey(src));
        el.setAttribute("alt", plain(attachment?.alt || post.title));
      }
    }
    if (el.tagName === "A") el.setAttribute("href", convertLink(el.getAttribute("href"), post.id) || "");
    if (el.getAttribute("target") === "_blank") el.setAttribute("rel", "noopener noreferrer");
    if (el.tagName === "IFRAME") {
      try {
        const url = new URL(el.getAttribute("src"));
        if (!["www.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname) || !url.pathname.startsWith("/embed/")) el.remove();
      } catch { el.remove(); }
    }
  }
  return DOMPurify.sanitize(body.innerHTML, {
    USE_PROFILES: { html: true }, ADD_TAGS: ["iframe"],
    ADD_ATTR: ["loading", "decoding", "allowfullscreen", "target", "rel"],
    FORBID_TAGS: ["style", "script", "form"], FORBID_ATTR: ["style"],
  });
}
function seoText(raw, post) {
  return plain(raw).replace(/%(?:title|sitename|sep|currentyear|date|excerpt)%/g, (token) => ({
    "%title%": plain(post.title), "%sitename%": "Jade Hospitainment", "%sep%": "|",
    "%currentyear%": post.publishedAt.slice(0, 4), "%date%": post.publishedAt.slice(0, 10),
    "%excerpt%": plain(post.excerpt),
  })[token]);
}
const docs = source.posts.map((post) => {
  const html = prepareBody(post);
  const words = plain(html).split(/\s+/).filter(Boolean).length;
  const warnings = [];
  if (words < 80) warnings.push(`Incomplete original article (${words} words); retained as draft for review.`);
  const body = document.createElement("div");
  body.innerHTML = html;
  const featured = source.attachments[post.meta._thumbnail_id];
  const ogIds = [...(post.meta.rank_math_og_content_image || "").matchAll(/i:\d+;i:(\d+);/g)].map((m) => m[1]);
  const og = source.attachments[ogIds[0]];
  const image = registerMedia(featured?.url || body.querySelector("img")?.getAttribute("src") || og?.url, post.id) || "/og-default.jpg";
  const excerpt = plain(post.excerpt) || plain(body.querySelector("p")?.innerHTML || html).slice(0, 240);
  const slug = post.slug.toLowerCase();
  const description = seoText(post.meta.rank_math_description || post.meta._yoast_wpseo_metadesc, post) || excerpt.slice(0, 160);
  const status = post.status === "publish" && !warnings.length ? "published" : "draft";
  const marker = `WordPress import: ${site.hostname}#post:${post.id}`;
  const doc = {
    pageKey: `blog/${slug}`, status,
    meta: {
      title: plain(post.title), slug, excerpt, description, image, thumbnailImage: image,
      author: plain(post.author) || "Jade Hospitainment",
      category: plain(source.categories[post.meta.rank_math_primary_category] || post.categories.find((c) => c !== "Uncategorized") || "Journal"),
      tags: post.tags.map(plain), readTime: `${Math.max(1, Math.ceil(words / 200))} min read`,
      publishedAt: post.publishedAt.slice(0, 10), dateModified: post.dateModified.slice(0, 10),
      isFeatured: false, isPinned: false, featuredOrder: 0,
      schemas: { article: true, faq: false, howTo: false, breadcrumb: true }, faqs: [],
      seo: {
        metaTitle: seoText(post.meta.rank_math_title || post.meta._yoast_wpseo_title, post) || plain(post.title),
        focusKeyword: plain(post.meta.rank_math_focus_keyword || post.meta._yoast_wpseo_focuskw),
        canonicalUrl: `${site.origin}/${slug}/`,
        ogTitle: seoText(post.meta.rank_math_facebook_title, post) || plain(post.title),
        ogDescription: seoText(post.meta.rank_math_facebook_description, post) || description,
        ogImage: registerMedia(og?.url, post.id) || image,
        robotsIndex: !/(?:^|[";])noindex(?:[";]|$)/i.test(post.meta.rank_math_robots || ""), robotsFollow: true,
      },
      internalNotes: `${marker}\nOriginal URL: ${post.url}\nOriginal categories: ${post.categories.map(plain).join(", ")}\n${warnings.join("\n")}`,
      previousSlugs: post.oldSlugs.filter(Boolean),
    },
    sections: [{ sectionKey: `wordpress-${post.id}`, type: "html", rawHtml: `<div class="wordpress-blog">${html}</div>` }],
    internalNotes: marker, versions: [], createdAt: new Date(), updatedAt: new Date(),
  };
  report.posts.push({ wordpressId: post.id, slug, title: doc.meta.title, status, words, warnings, originalUrl: post.url, destination: `/${slug}/` });
  return doc;
});
if (new Set(docs.map((d) => d.pageKey)).size !== docs.length) throw new Error("Duplicate target slugs; import stopped.");
console.log(`Prepared ${docs.length} posts: ${docs.filter((d) => d.status === "published").length} published, ${docs.filter((d) => d.status === "draft").length} drafts. ${media.size} unique media files.`);

async function fetchMedia(item) {
  const destination = path.join(root, "public", item.local);
  const originalDestination = path.join(root, "public", decodeURIComponent(item.originalLocal));
  if (!originalDestination.startsWith(path.join(root, "public/wp-content/uploads/"))) throw new Error("Invalid media path");
  try {
    const metadata = await sharp(destination).metadata();
    await fs.access(originalDestination);
    if (metadata.width) { item.status = "cached"; return; }
  } catch { /* no valid cached file */ }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(item.source, { signal: AbortSignal.timeout(25_000), headers: { "User-Agent": "JadeBlogMigration/1.0" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.headers.get("content-type")?.startsWith("image/")) throw new Error("Source is not an image");
      const bytes = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(bytes).metadata();
      if (!metadata.width) throw new Error("Invalid image");
      await fs.mkdir(path.dirname(originalDestination), { recursive: true });
      await fs.writeFile(`${originalDestination}.part`, bytes);
      await fs.rename(`${originalDestination}.part`, originalDestination);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await sharp(bytes, { animated: true }).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`${destination}.part`);
      await fs.rename(`${destination}.part`, destination);
      item.status = "downloaded";
      return;
    } catch (e) {
      item.error = e.message;
      if (/HTTP (404|410)/.test(e.message)) break;
    }
  }
  item.status = "failed";
}
if (downloadMedia) {
  const queue = [...media.values()];
  let done = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await fetchMedia(item);
      done++;
      if (done % 50 === 0 || done === media.size) console.log(`Media ${done}/${media.size}; failures: ${[...media.values()].filter((m) => m.status === "failed").length}`);
    }
  }));
  for (const doc of docs) {
    const rewrite = (value) => {
      const item = media.get(value);
      return item && item.status !== "failed" ? item.local : value;
    };
    doc.meta.image = rewrite(doc.meta.image);
    doc.meta.thumbnailImage = rewrite(doc.meta.thumbnailImage);
    doc.meta.seo.ogImage = rewrite(doc.meta.seo.ogImage);
    const body = document.createElement("div");
    body.innerHTML = doc.sections[0].rawHtml;
    for (const el of body.querySelectorAll("img[src],a[href]")) {
      const attr = el.tagName === "IMG" ? "src" : "href";
      el.setAttribute(attr, rewrite(el.getAttribute(attr)));
    }
    doc.sections[0].rawHtml = body.innerHTML;
  }
}
const redirectMap = new Map();
const ambiguousAliases = new Set();
for (let i = 0; i < docs.length; i++) {
  if (docs[i].status !== "published") continue;
  const post = source.posts[i];
  const destination = `/${docs[i].meta.slug}/`;
  const paths = [normalizePath(new URL(post.url, site).pathname), ...post.oldSlugs.filter((s) => s && !/[/?#]/.test(s)).map((s) => `/${s}`)];
  for (const from of paths) {
    if (ambiguousAliases.has(from)) continue;
    if (from === normalizePath(destination) || knownPages.has(from)) continue;
    // Historical aliases must never override another article's actual URL.
    if (postPaths.has(from) && postPaths.get(from) !== destination) continue;
    if (redirectMap.has(from) && redirectMap.get(from) !== destination) {
      report.conflicts.push({ type: "historical-slug", source: from });
      ambiguousAliases.add(from);
      redirectMap.delete(from);
      continue;
    }
    redirectMap.set(from, destination);
  }
}
report.redirects = [...redirectMap].map(([source, destination]) => ({ source, destination, statusCode: 301 }));
report.media = [...media.values()];
report.unknownInternalLinks = [...unknownLinks].map(([urlPath, ids]) => ({ path: urlPath, postIds: [...ids] }));
await fs.writeFile(path.join(output, "prepared-posts.json"), JSON.stringify(docs, null, 2));

if (apply) {
  loadEnvLocal();
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required for --apply");
  usePublicDnsForMongo();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  try {
    const pages = mongoose.connection.collection("contentpages");
    const redirects = mongoose.connection.collection("seoredirects");
    const existing = await pages.find({ pageKey: { $in: docs.map((d) => d.pageKey) } }).toArray();
    const existingRedirects = await redirects.find({ fromPath: { $in: report.redirects.map((r) => r.source) } }).toArray();
    const backup = path.join(output, `backup-${Date.now()}.json`);
    await fs.writeFile(backup, JSON.stringify({ pages: existing, redirects: existingRedirects }, null, 2));
    // Never overwrite CMS edits or another migration. Rerunning is insert-only.
    const byKey = new Map(existing.map((d) => [d.pageKey, d]));
    const newDocs = docs.filter((doc) => {
      const old = byKey.get(doc.pageKey);
      if (old && old.internalNotes !== doc.internalNotes) report.conflicts.push({ type: "existing-post", pageKey: doc.pageKey });
      return !old;
    });
    if (report.conflicts.some((c) => c.type === "existing-post")) throw new Error("Existing CMS post conflicts; no posts imported. See backup.");
    if (newDocs.length) await pages.insertMany(newDocs);
    report.inserted = newDocs.length;
    report.skippedExisting = existing.length;
    const existingSources = new Map(existingRedirects.map((r) => [r.fromPath, r]));
    const safeRedirects = report.redirects.filter((r) => {
      const old = existingSources.get(r.source);
      if (old && (old.toPath !== r.destination || old.status !== "disabled")) {
        report.conflicts.push({ type: "existing-redirect", source: r.source });
        return false;
      }
      return true;
    });
    for (const r of safeRedirects) {
      await redirects.updateOne({ fromPath: r.source }, { $setOnInsert: {
        fromPath: r.source, toPath: r.destination, type: "301", status: "disabled", testStatus: "untested",
        note: "WordPress blog migration", createdAt: new Date(), updatedAt: new Date(),
      } }, { upsert: true });
    }
    await redirects.updateMany({
      fromPath: { $in: [...ambiguousAliases] }, status: "disabled", note: "WordPress blog migration",
    }, { $set: { testStatus: "conflict" } });
    const configFile = path.join(root, "docs/wordpress-blog-redirects.proposed.json");
    let oldConfig = [];
    try { oldConfig = JSON.parse(await fs.readFile(configFile, "utf8")); } catch { /* initial import */ }
    const config = new Map(oldConfig.map((r) => [r.source, r]));
    for (const alias of ambiguousAliases) config.delete(alias);
    for (const r of safeRedirects) {
      if (config.has(r.source) && config.get(r.source).destination !== r.destination) throw new Error(`Existing generated redirect conflict: ${r.source}`);
      config.set(r.source, r);
    }
    await fs.mkdir(path.dirname(configFile), { recursive: true });
    await fs.writeFile(configFile, JSON.stringify([...config.values()].sort((a, b) => a.source.localeCompare(b.source)), null, 2) + "\n");
    report.database = mongoose.connection.name;
    report.redirectsCreated = safeRedirects.length;
    console.log(`Inserted ${newDocs.length} posts; preserved ${existing.length} existing posts. Prepared ${safeRedirects.length} disabled redirects.`);
  } finally { await mongoose.disconnect(); }
}
await fs.writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
window.close();
console.log(`Report: ${path.join(output, "report.json")}`);
console.log(`Unresolved internal destinations: ${unknownLinks.size}. Failed media: ${report.media.filter((m) => m.status === "failed").length}.`);
