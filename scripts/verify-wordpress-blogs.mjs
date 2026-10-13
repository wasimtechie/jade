/** Validate the actual migrated corpus, media files and public routes. */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { JSDOM } from "jsdom";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tmp/wordpress-migration");
const report = JSON.parse(await fs.readFile(path.join(out, "report.json"), "utf8"));
const prepared = JSON.parse(await fs.readFile(path.join(out, "prepared-posts.json"), "utf8"));
const base = process.env.WORDPRESS_VERIFY_BASE_URL || "http://localhost:3000";
loadEnvLocal();
usePublicDnsForMongo();
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
try {
  const actual = await mongoose.connection.collection("contentpages").find({ pageKey: { $in: prepared.map((d) => d.pageKey) } }).toArray();
  assert.equal(actual.length, report.totalPosts, "Every source post must exist in the CMS");
  const byKey = new Map(actual.map((d) => [d.pageKey, d]));
  const window = new JSDOM("").window;
  for (const expected of prepared) {
    const doc = byKey.get(expected.pageKey);
    assert.equal(doc.status, expected.status);
    assert.deepEqual(doc.meta, expected.meta, `Metadata changed for ${expected.pageKey}`);
    assert.deepEqual(doc.sections, expected.sections, `Body changed for ${expected.pageKey}`);
    const body = window.document.createElement("div");
    body.innerHTML = doc.sections[0].rawHtml;
    assert.equal(body.querySelectorAll("script,style,form,h1").length, 0);
    for (const el of body.querySelectorAll("*")) {
      for (const attr of el.attributes) assert.ok(!/^on/i.test(attr.name), "Event handlers cannot be imported");
    }
    for (const img of body.querySelectorAll("img")) {
      assert.ok(img.hasAttribute("alt"), "Image alt text must survive migration");
      if (img.getAttribute("src")?.startsWith("/")) await fs.access(path.join(root, "public", decodeURIComponent(img.getAttribute("src"))));
    }
  }
  window.close();
} finally { await mongoose.disconnect(); }
for (const media of report.media) {
  assert.notEqual(media.status, "failed", `Missing image: ${media.source}`);
  await fs.access(path.join(root, "public", media.local));
  await fs.access(path.join(root, "public", decodeURIComponent(media.originalLocal)));
}
console.log(`CMS verified: ${prepared.length} posts, sanitized bodies and metadata. Media verified: ${report.media.length} originals and optimized copies.`);
const queue = report.posts.filter((p) => p.status === "published");
const failures = [];
let checked = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const post = queue.shift();
    try {
      const response = await fetch(`${base}${post.destination}`, { signal: AbortSignal.timeout(60000) });
      assert.equal(response.status, 200);
      assert.equal(new URL(response.url).pathname, post.destination, "Original trailing slash URL must serve directly");
      const html = await response.text();
      assert.ok(html.includes(`href="${report.sourceSite.replace(/\/$/, "")}${post.destination}"`), "Missing canonical URL");
      assert.ok(html.includes('class="wordpress-blog"'), "Imported article body missing");
    } catch (e) { failures.push({ slug: post.slug, error: e.message }); }
    checked++;
    if (checked % 100 === 0) console.log(`Public articles verified: ${checked}`);
  }
}));
assert.deepEqual(failures, [], "Some public articles failed");
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
for (const post of report.posts) {
  if (post.status === "published") assert.ok(sitemap.includes(`${report.sourceSite.replace(/\/$/, "")}${post.destination}`), `Missing sitemap entry: ${post.slug}`);
}
for (const post of report.posts.filter((p) => p.status === "draft")) {
  const response = await fetch(`${base}${post.destination}`);
  assert.equal(response.status, 404, `Draft article publicly exposed: ${post.slug}`);
}
assert.equal((await fetch(`${base}/this-blog-does-not-exist-wordpress-migration/`)).status, 404);
const sample = report.posts.find((p) => p.status === "published");
const legacy = await fetch(`${base}/blogs/${sample.slug}`, { redirect: "manual" });
assert.equal(legacy.status, 308);
assert.equal(legacy.headers.get("location"), sample.destination);
const summary = { verifiedAt: new Date().toISOString(), cmsPosts: prepared.length,
  publishedArticlesChecked: checked, draftsChecked: report.posts.filter((p) => p.status === "draft").length,
  mediaFilesChecked: report.media.length, sitemap: "passed", legacyRoute: "passed", unknownRoute: "passed", failures };
await fs.writeFile(path.join(out, "verification.json"), JSON.stringify(summary, null, 2));
console.log(`Verified ${checked} article URLs, sitemap, draft visibility, legacy route and unknown-route 404.`);
