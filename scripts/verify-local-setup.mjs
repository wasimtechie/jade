/**
 * Checks what is ready for local Jade dev (run after each setup step).
 *   npm run setup:check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const checks = [];

function pass(label, detail = "") {
  checks.push({ ok: true, label, detail });
}
function fail(label, detail = "") {
  checks.push({ ok: false, label, detail });
}

function hasCommand(cmd) {
  try {
    if (process.platform === "win32") {
      execSync(`where ${cmd}`, { stdio: "ignore" });
    } else {
      execSync(`which ${cmd}`, { stdio: "ignore" });
    }
    return true;
  } catch {
    return false;
  }
}

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return null;
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  console.log("\n  Jade ReVamp — local setup check\n");

  if (hasCommand("node")) {
    const v = process.version;
    pass("Node.js installed", v);
  } else fail("Node.js installed", "Install from https://nodejs.org (LTS)");

  if (fs.existsSync(path.join(root, "node_modules"))) {
    pass("npm dependencies", "node_modules present");
  } else {
    fail("npm dependencies", "Run: npm install");
  }

  const env = loadEnvLocal();
  if (env) {
    pass(".env.local exists", path.join(root, ".env.local"));
    if (env.NEXTAUTH_SECRET?.length >= 16) {
      pass("NEXTAUTH_SECRET set");
    } else {
      fail(
        "NEXTAUTH_SECRET set",
        "Generate with: openssl rand -base64 32",
      );
    }
    if (env.MONGODB_URI?.startsWith("mongodb")) {
      pass("MONGODB_URI configured");
    } else {
      fail(
        "MONGODB_URI configured",
        "Add MongoDB Atlas or local replica-set URI — see DEPLOYMENT.md",
      );
    }
    pass("Live enquiry API", "Forms POST /api/leads");
    pass("Live careers API", "Forms POST /api/careers/apply");
  } else {
    fail(".env.local exists", "Copy .env.example → .env.local (or use repo template)");
  }

  console.log("");
  for (const c of checks) {
    const icon = c.ok ? "✓" : "✗";
    const color = c.ok ? "\x1b[32m" : "\x1b[31m";
    console.log(`  ${color}${icon}\x1b[0m  ${c.label}`);
    if (c.detail) console.log(`      ${c.detail}`);
  }

  const failed = checks.filter((c) => !c.ok).length;
  console.log(
    failed
      ? `\n  ${failed} item(s) need attention — open README.md\n`
      : "\n  All checks passed. Run: npm run dev → http://localhost:3000/dashboard\n",
  );
  process.exit(failed ? 1 : 0);
}

main();
