/**
 * Phase 2 smoke test — POST /api/leads and /api/careers/apply (expects live Postgres).
 * Dev server must be running with demo flags OFF.
 *
 *   npm run api:smoke
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run api:smoke
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ??
  process.env.SMOKE_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:3000";

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function postMultipart(url, form) {
  const res = await fetch(url, { method: "POST", body: form });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function main() {
  loadEnvLocal();

  console.log(`Smoke tests → ${base}\n`);

  const leads = await postJson(`${base}/api/leads`, {
    source: "general_enquiry",
    payload: {
      fullName: "Phase2 Smoke",
      email: "phase2-smoke@example.com",
      phoneNumber: "9876543210",
      guests: "2",
      preferredDate: "2026-07-01",
      occasionType: "Family",
      specialRequests: "API smoke test",
    },
  });

  if (leads.status === 201 && leads.json?.ok) {
    console.log("✓ POST /api/leads → 201", leads.json.leadId ?? "");
  } else {
    console.error("✗ POST /api/leads →", leads.status, leads.json);
    process.exitCode = 1;
  }

  const pdfBytes = Buffer.from(
    "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n",
    "utf8",
  );
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const form = new FormData();
  form.append("job_id", "guest-relations-executive");
  form.append("job_title", "Guest Relations Executive");
  form.append("source_page", "/careers");
  form.append("apply_context", "careers:role:guest-relations-executive");
  form.append("client_path", "/careers");
  form.append("full_name", "Phase2 Smoke");
  form.append("email", "careers-smoke@example.com");
  form.append("phone", "9876543210");
  form.append("company", "");
  form.append(
    "resume",
    new File([blob], "smoke-resume.pdf", { type: "application/pdf" }),
  );

  const careers = await postMultipart(`${base}/api/careers/apply`, form);

  if (careers.status === 201 && careers.json?.ok) {
    console.log("✓ POST /api/careers/apply → 201", careers.json.applicationId ?? "");
  } else {
    console.error("✗ POST /api/careers/apply →", careers.status, careers.json);
    process.exitCode = 1;
  }

  if (process.exitCode) {
    console.log(
      "\nFix: set MONGODB_URI + demo flags false → npm run dev",
    );
    process.exit(1);
  }

  console.log("\nPhase 2 API smoke passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
