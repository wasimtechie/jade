import { createElement } from "react";
import { LeadNotificationEmail } from "@/emails/LeadNotification";
import { leadSourceLabel } from "@/lib/leads/sourceLabels";
import { renderEmail } from "@/lib/email/renderEmail";
import { sendTransactionalEmail } from "@/lib/email/resendOutbound";
import { getStaffNotifyRecipients } from "@/lib/email/staffRecipients";
import { getSiteBaseUrl } from "@/lib/siteUrl";

function parseLeadPreview(preview: string): {
  name: string;
  email: string;
  phone: string;
  guests: string;
  preferredDate: string;
  occasion: string;
  enquiryPage: string;
  interests: string;
  message: string;
} {
  const lines = preview.split("\n");
  const pick = (prefix: string) => {
    const line = lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  };
  const normalizeBlob = (value: string) =>
    value && value !== "{}" && value !== "[]" ? value : "";
  const special = pick("Special requests:");
  const occasion = pick("Occasion:");
  const notes = pick("Notes:");
  const services = pick("Services:");
  const events = pick("Events:");
  const setting = pick("Setting:");
  const messageParts = [special || notes, services, events, setting].filter(Boolean);
  return {
    name: pick("Name:"),
    email: pick("Email:").replace("(not provided)", "").trim(),
    phone: pick("Phone:"),
    guests: pick("Guests:"),
    preferredDate: pick("Preferred date:"),
    occasion,
    enquiryPage: pick("Enquiry page:"),
    interests: normalizeBlob(
      pick("Travel preferences:") || pick("Interests:"),
    ),
    message: messageParts.length ? messageParts.join("\n") : preview,
  };
}

export async function notifyNewLead(params: {
  source: string;
  preview: string;
  replyToEmail?: string | null;
}): Promise<void> {
  const to = getStaffNotifyRecipients();
  if (to.length === 0) return;

  const parsed = parseLeadPreview(params.preview);
  const replyTo =
    params.replyToEmail?.trim() ||
    (parsed.email && parsed.email.includes("@") ? parsed.email : undefined);

  const rendered = await renderEmail(
    createElement(LeadNotificationEmail, {
      sourceLabel: leadSourceLabel(params.source),
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      guests: parsed.guests || undefined,
      preferredDate: parsed.preferredDate || undefined,
      occasion: parsed.occasion || undefined,
      enquiryPage: parsed.enquiryPage || undefined,
      interests: parsed.interests || undefined,
      message: parsed.message,
      dashboardUrl: `${getSiteBaseUrl()}/dashboard/leads`,
    }),
  );

  const r = await sendTransactionalEmail({
    to,
    subject: `[Jade lead] ${leadSourceLabel(params.source)}`,
    text: rendered.text,
    html: rendered.html,
    replyTo,
  });
  if (!r.sent) console.warn("[leads email]", r.reason);
}
