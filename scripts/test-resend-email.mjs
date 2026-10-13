/**
 * Smoke test: send HTML email via Resend to STAFF_NOTIFY_EMAIL.
 * Usage: npm run email:test
 */
import { Resend } from "resend";
import { loadEnvLocal } from "./loadEnvLocal.mjs";

loadEnvLocal();

const apiKey = process.env.RESEND_API_KEY?.trim();
const from =
  process.env.RESEND_FROM?.trim() ||
  "Jade Retreats <onboarding@resend.dev>";
const to =
  process.env.STAFF_NOTIFY_EMAIL?.trim() ||
  process.env.BOOKING_NOTIFY_EMAIL?.split(/[,;]/)[0]?.trim();

if (!apiKey) {
  console.error("RESEND_API_KEY missing — set it in .env.local");
  process.exit(1);
}

if (!to) {
  console.error(
    "STAFF_NOTIFY_EMAIL missing — set Enquiry@jaderetreats.com in .env.local",
  );
  process.exit(1);
}

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from,
  to: [to],
  subject: "[Jade] Resend smoke test",
  html: `<div style="font-family:sans-serif"><h1>Jade Retreats</h1><p>Resend HTML smoke test from <code>scripts/test-resend-email.mjs</code>.</p><p>If you received this, transactional email is configured.</p></div>`,
  text: "Jade Retreats — Resend smoke test. If you received this, transactional email is configured.",
});

if (error) {
  console.error("Resend send failed:", error);
  process.exit(1);
}

console.log(`Email sent to ${to} (id: ${data?.id ?? "unknown"})`);
