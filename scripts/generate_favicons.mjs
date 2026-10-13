import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const repoRoot = process.cwd();
const inputPath = path.join(repoRoot, "public", "assets", "Golden_Logo.png");

const outputs = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function makeSquarePng(size) {
  // The source logo is slightly rectangular; contain + transparent padding keeps it undistorted.
  return sharp(inputPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  const publicDir = path.join(repoRoot, "public");
  await fs.access(inputPath);

  const icoPngSizes = [16, 32, 48];
  const icoPngBuffers = await Promise.all(icoPngSizes.map(makeSquarePng));
  const icoBuffer = await pngToIco(icoPngBuffers);
  await fs.writeFile(path.join(publicDir, "favicon.ico"), icoBuffer);

  await Promise.all(
    outputs.map(async ({ name, size }) => {
      const buf = await makeSquarePng(size);
      await fs.writeFile(path.join(publicDir, name), buf);
    }),
  );

  const manifest = {
    name: "Jade Hospitainment",
    short_name: "Jade",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#000000",
    background_color: "#000000",
    display: "standalone",
  };
  await fs.writeFile(
    path.join(publicDir, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  // Basic Windows tile metadata (optional but nice to have).
  const browserConfigXml = `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/android-chrome-192x192.png"/>\n      <TileColor>#000000</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>\n`;
  await fs.writeFile(path.join(publicDir, "browserconfig.xml"), browserConfigXml);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
