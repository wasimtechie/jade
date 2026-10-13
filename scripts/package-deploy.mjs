/** Create a source release; install native dependencies and build on the VPS. */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const run = promisify(execFile);
const files = [];
const excluded = (name) => name === ".DS_Store" || name.endsWith(".tsbuildinfo") ||
  /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(name) || /\.(?:log|bak|tmp|part|pem)$/.test(name) ||
  name.startsWith(".env") && name !== ".env.example";

async function collect(relative) {
  const absolute = path.join(root, relative);
  const stat = await fs.lstat(absolute);
  if (stat.isSymbolicLink()) throw new Error(`Deployment source cannot contain symlinks: ${relative}`);
  if (excluded(path.basename(relative))) return;
  if (stat.isDirectory()) {
    for (const entry of await fs.readdir(absolute)) await collect(path.join(relative, entry));
  } else if (stat.isFile()) {
    files.push(relative);
  }
}

// Deliberate allowlist: local databases, exports, archives, editor state and
// node_modules never enter the release. Runtime images and seed data stay.
for (const entry of [
  "src", "public", "scripts", "package.json", "package-lock.json", "next.config.mjs",
  "tsconfig.json", "next-env.d.ts", "postcss.config.js", "tailwind.config.ts",
  ".env.example", "README.md", "DEPLOYMENT.md",
  "docs/wordpress-blog-migration.md", "docs/wordpress-blog-redirects.proposed.json",
  "docs/axisrooms-api-reference.md",
]) await collect(entry);

files.sort();
if (files.some((name) => name.includes("\n") || name.includes("\0"))) throw new Error("Invalid deployment filename");
await fs.mkdir(out, { recursive: true });
const fileList = path.join(out, "files.nul");
await fs.writeFile(fileList, files.join("\0") + "\0");
const bundle = path.join(out, "jade-source.tar.gz");
await run("tar", ["-czf", bundle, "--null", "-T", fileList], {
  cwd: root, env: { ...process.env, COPYFILE_DISABLE: "1" }, maxBuffer: 1024 * 1024,
});
await fs.unlink(fileList);
const bytes = await fs.readFile(bundle);
const manifest = {
  createdAt: new Date().toISOString(), package: path.basename(bundle),
  sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  sizeBytes: bytes.length, fileCount: files.length, files,
  status: "source bundle; production readiness must be confirmed separately",
};
await fs.writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Source bundle: ${bundle}`);
console.log(`${files.length} files; ${(bytes.length / 1024 / 1024).toFixed(1)} MiB; SHA256 ${manifest.sha256}`);
