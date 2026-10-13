/**
 * One-shot OG image: 1200×630 JPEG at public/og-default.jpg from a hero asset.
 * Run: node scripts/generate_og_default.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(
  root,
  "public",
  "Villa_Retreats",
  "Wonderland",
  "Hero",
  "hero.webp",
);
const out = path.join(root, "public", "og-default.jpg");

await sharp(src)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .jpeg({ quality: 86 })
  .toFile(out);

console.log("Wrote", out);
