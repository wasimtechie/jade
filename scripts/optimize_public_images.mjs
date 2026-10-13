#!/usr/bin/env node
/**
 * =============================================================================
 * optimize_public_images.mjs — Public folder image conversion & compression
 * =============================================================================
 *
 * WHAT THIS SCRIPT DOES
 * ---------------------
 * Recursively walks a directory under the project (default: `public/`) and
 * optimizes **raster** images for the web:
 *
 *   1) **Conversion** — JPEG, PNG, HEIC/HEIF, TIFF, and embedded JPEG from
 *      Canon CR2/CR3 → **WebP** (modern, broadly supported, smaller than JPEG
 *      at equivalent visual quality).
 *   2) **Compression / refinement** — Existing `.webp` files may be resized
 *      (if wider than `--max-width`) and/or re-encoded when the output would
 *      be smaller or dimensions need capping—without lowering quality below
 *      the `--quality` target (default **92**, which is effectively visually
 *      lossless for most photos).
 *   3) **Performance goals** — Capping extreme resolutions reduces decode cost
 *      and memory in the browser (better LCP / smoother scrolling). WebP at
 *      high quality keeps file sizes down versus originals without visible loss.
 *
 * WHAT THIS SCRIPT DOES **NOT** DO
 * --------------------------------
 *   • Does not modify SVG, ICO, MP4, fonts, JSON, or other non-raster assets.
 *   • Does not run during `npm run build`; run it manually when adding/updating
 *     photography (then commit optimized assets).
 *
 * DEFAULT QUALITY POLICY (balanced “no visible loss” vs size)
 * -----------------------------------------------------------
 *   `--quality` default **92** — industry‑common “high” WebP; bump to 95 if you
 *   pixel‑peep artifacts on specific shots; lower only if you accept visible loss.
 *   `--max-width` default **2560** — never upscale; only shrinks very large camera
 *   files so Next/Image and browsers decode faster (adjust if you need full‑rez archives).
 *
 * SAFETY
 * ------
 *   By default **`--keep-sources`** — JPG/PNG/HEIC originals remain after a successful
 *   `.webp` write (you can delete duplicates manually). Pass **`--delete-sources`** only
 *   after verifying galleries in the browser.
 *   Use **`--dry-run`** to print actions without writing files.
 *
 * USAGE
 * -----
 *   npm run optimize-images
 *   npm run optimize-images:dry-run
 *   node scripts/optimize_public_images.mjs --dir public/Villa_Retreats/Emerald
 *   node scripts/optimize_public_images.mjs --delete-sources --quality 92
 *
 * =============================================================================
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

let heicConvert = null;
try {
  heicConvert = require("heic-convert");
} catch {
  console.warn(
    "[optimize_public_images] heic-convert not installed — HEIC files will be skipped.",
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const out = {
    dir: "public",
    dryRun: false,
    deleteSources: false,
    quality: 92,
    maxWidth: 2560,
    effort: 6,
    skipWebpPass: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--delete-sources") out.deleteSources = true;
    else if (a === "--keep-sources") out.deleteSources = false;
    else if (a === "--skip-webp-recompress") out.skipWebpPass = true;
    else if (a === "--dir" && argv[i + 1]) {
      out.dir = argv[++i];
    } else if (a.startsWith("--quality="))
      out.quality = Number(a.split("=")[1]) || 92;
    else if (a === "--quality" && argv[i + 1])
      out.quality = Number(argv[++i]) || 92;
    else if (a.startsWith("--max-width="))
      out.maxWidth = Number(a.split("=")[1]) || 2560;
    else if (a === "--max-width" && argv[i + 1])
      out.maxWidth = Number(argv[++i]) || 2560;
    else if (a === "--help" || a === "-h") {
      console.log(`
Usage: node scripts/optimize_public_images.mjs [options]

Options:
  --dir <path>          Folder under project root (default: public)
  --dry-run             Show planned actions only
  --quality <1-100>     WebP quality (default: 92)
  --max-width <px>      Max width; never upscale (default: 2560)
  --delete-sources      Remove JPG/PNG/HEIC/… after successful WebP write (destructive)
  --keep-sources        Do not delete originals (default)
  --skip-webp-recompress  Only convert non-webp; do not reprocess .webp
`);
      process.exit(0);
    }
  }
  return out;
}

const RASTER_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
  ".cr2",
  ".cr3",
]);

const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "coverage",
]);

async function walk(dir, visitor) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR.has(ent.name) || ent.name.startsWith(".")) continue;
      await walk(full, visitor);
    } else {
      await visitor(full);
    }
  }
}

function extOf(p) {
  return path.extname(p).toLowerCase();
}

/** Extract embedded JPEG from Canon CR2/CR3 buffer (same idea as legacy villa scripts). */
function extractCrJpegBuffer(rawBuf) {
  let soi = -1;
  for (let i = 0; i < rawBuf.length - 1; i++) {
    if (rawBuf[i] === 0xff && rawBuf[i + 1] === 0xd8) {
      soi = i;
      break;
    }
  }
  let eoi = -1;
  for (let i = rawBuf.length - 2; i >= 0; i--) {
    if (rawBuf[i] === 0xff && rawBuf[i + 1] === 0xd9) {
      eoi = i + 2;
      break;
    }
  }
  if (soi < 0 || eoi < 0) return null;
  return rawBuf.subarray(soi, eoi);
}

async function decodeToSharpInput(filePath, ext) {
  const buf = await fs.readFile(filePath);
  if (ext === ".heic" || ext === ".heif") {
    if (!heicConvert) throw new Error("HEIC requires heic-convert");
    const jpegBuffer = await heicConvert({
      buffer: buf,
      format: "JPEG",
      quality: 0.98,
    });
    return Buffer.from(jpegBuffer);
  }
  if (ext === ".cr2" || ext === ".cr3") {
    const jpegBuf = extractCrJpegBuffer(buf);
    if (!jpegBuf) throw new Error("No embedded JPEG in RAW file");
    return jpegBuf;
  }
  return buf;
}

function webpOptions(quality, effort, hasAlpha) {
  const o = {
    quality,
    effort,
    smartSubsample: true,
  };
  if (hasAlpha) o.alphaQuality = 100;
  return o;
}

async function processFile(absPath, opts) {
  const ext = extOf(absPath);
  if (!RASTER_EXT.has(ext)) return;

  const dir = path.dirname(absPath);
  const stem = path.basename(absPath, path.extname(absPath));
  const webpOut = path.join(dir, `${stem}.webp`);

  const stats = {
    converted: 0,
    skipped: 0,
    webpTouched: 0,
    errors: 0,
  };

  try {
    // ----- Existing WebP: optional lossless-size pass -----
    if (ext === ".webp") {
      if (opts.skipWebpPass) return stats;
      const input = await fs.readFile(absPath);
      const meta = await sharp(input).metadata();
      const hasAlpha = meta.hasAlpha === true;
      const pipeline = sharp(input).rotate();
      let needsResize =
        meta.width && meta.width > opts.maxWidth ? true : false;
      const resized = needsResize
        ? pipeline.resize({
            width: opts.maxWidth,
            withoutEnlargement: true,
          })
        : pipeline;

      const tmpPath = absPath + ".opt.tmp.webp";
      await resized
        .webp(webpOptions(opts.quality, opts.effort, hasAlpha))
        .toFile(tmpPath);

      const oldSz = (await fs.stat(absPath)).size;
      const newSz = (await fs.stat(tmpPath)).size;
      const better = newSz < oldSz || needsResize;
      if (opts.dryRun) {
        console.log(
          `[dry-run] webp ${better ? "would optimize" : "would skip"}: ${path.relative(PROJECT_ROOT, absPath)} (${oldSz} → ${newSz})`,
        );
        await fs.unlink(tmpPath).catch(() => {});
        stats.skipped += better ? 0 : 1;
        return stats;
      }
      if (better) {
        await fs.rename(tmpPath, absPath);
        stats.webpTouched++;
        console.log(
          `Optimized webp: ${path.relative(PROJECT_ROOT, absPath)} (${(oldSz / 1024).toFixed(1)}KB → ${(newSz / 1024).toFixed(1)}KB)`,
        );
      } else {
        await fs.unlink(tmpPath);
        stats.skipped++;
      }
      return stats;
    }

    // ----- Raster → WebP -----
    let inputBuffer = await decodeToSharpInput(absPath, ext);
    const meta = await sharp(inputBuffer).metadata();
    const hasAlpha = meta.hasAlpha === true;
    let pipeline = sharp(inputBuffer).rotate();

    if (meta.width && meta.width > opts.maxWidth) {
      pipeline = pipeline.resize({
        width: opts.maxWidth,
        withoutEnlargement: true,
      });
    }

    if (opts.dryRun) {
      console.log(
        `[dry-run] would write: ${path.relative(PROJECT_ROOT, webpOut)} (from ${path.relative(PROJECT_ROOT, absPath)})`,
      );
      stats.converted++;
      return stats;
    }

    const tmpPath = webpOut + ".tmp.webp";
    await pipeline
      .webp(webpOptions(opts.quality, opts.effort, hasAlpha))
      .toFile(tmpPath);
    await fs.rename(tmpPath, webpOut);
    stats.converted++;
    console.log(
      `Created: ${path.relative(PROJECT_ROOT, webpOut)} ← ${path.relative(PROJECT_ROOT, absPath)}`,
    );

    if (opts.deleteSources) {
      await fs.unlink(absPath);
      console.log(`  Removed source: ${path.relative(PROJECT_ROOT, absPath)}`);
    }
    return stats;
  } catch (e) {
    console.error(`Error ${absPath}:`, e.message);
    stats.errors++;
    return stats;
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const targetDir = path.isAbsolute(opts.dir)
    ? opts.dir
    : path.join(PROJECT_ROOT, opts.dir);

  console.log(`
━━━ optimize_public_images ━━━
Target:     ${targetDir}
Dry run:    ${opts.dryRun}
Quality:    ${opts.quality}
Max width:  ${opts.maxWidth}px
Delete src: ${opts.deleteSources} (use --keep-sources to retain JPG/PNG/HEIC after WebP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  try {
    await fs.access(targetDir);
  } catch {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  let converted = 0,
    webpTouched = 0,
    skipped = 0,
    errors = 0;

  await walk(targetDir, async (file) => {
    const r = await processFile(file, opts);
    if (r) {
      converted += r.converted || 0;
      webpTouched += r.webpTouched || 0;
      skipped += r.skipped || 0;
      errors += r.errors || 0;
    }
  });

  console.log(`
Done. New WebPs: ${converted}, WebPs recompressed: ${webpTouched}, skipped: ${skipped}, errors: ${errors}
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
