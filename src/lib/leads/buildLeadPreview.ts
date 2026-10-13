import {
  isGeneralLikeLeadSource,
  isLeadSource,
  leadSourceLabel,
  type LeadSource,
} from "./sourceLabels";
import { formatTravelPreferences } from "./presentation";

function normalizeEmail(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const v = s.trim().toLowerCase();
  if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
  return v;
}

function phoneDigits(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.replace(/\D/g, "");
}

function hasContactName(s: unknown): boolean {
  return typeof s === "string" && s.trim().length >= 2;
}

function hasValidPhone(s: unknown): boolean {
  return phoneDigits(s).length >= 10;
}

export type LeadCaptureResult =
  | { ok: true; email: string | null; preview: string }
  | { ok: false; status: number; error: string };

export function validateAndPreviewLead(body: Record<string, unknown>): LeadCaptureResult {
  const source = body.source;
  if (!isLeadSource(source)) {
    return { ok: false, status: 400, error: "Invalid source" };
  }

  const p = body.payload;
  if (p === null || typeof p !== "object") {
    return { ok: false, status: 400, error: "payload required" };
  }
  const o = p as Record<string, unknown>;

  if (isGeneralLikeLeadSource(source)) {
    const email = normalizeEmail(o.email);
    const travelPreferences = formatTravelPreferences(o.travelFormat).join(", ");

    if (source === "rathaa_enquiry") {
      if (!email) {
        return { ok: false, status: 400, error: "Valid email required" };
      }
    } else {
      const phoneOk = hasValidPhone(o.phoneNumber);
      const nameOk = hasContactName(o.fullName);
      if (!email && !(phoneOk && nameOk)) {
        const partialEmail =
          typeof o.email === "string" && o.email.trim().length > 0;
        return {
          ok: false,
          status: 400,
          error: partialEmail
            ? "Valid email required"
            : "Name and a valid phone number are required",
        };
      }
    }

    const preview = [
      `Source: ${source} (${leadSourceLabel(source)})`,
      `Name: ${String(o.fullName ?? "").slice(0, 200)}`,
      `Email: ${email ?? "(not provided)"}`,
      `Phone: ${String(o.phoneNumber ?? "").slice(0, 40)}`,
      `Guests: ${String(o.guests ?? "").slice(0, 80)}`,
      `Preferred date: ${String(o.preferredDate ?? "").slice(0, 120)}`,
      ...(travelPreferences ? [`Travel preferences: ${travelPreferences}`] : []),
      `Occasion: ${String(o.occasionType ?? o.occasion ?? "").slice(0, 200)}`,
      `Special requests: ${String(o.specialRequests ?? o.queries ?? o.notes ?? "").slice(0, 2000)}`,
      `Enquiry page: ${String(o.enquiryPage ?? "").slice(0, 200)}`,
    ].join("\n");

    return { ok: true, email, preview };
  }

  const email = normalizeEmail(o.email);
  if (!email) {
    return { ok: false, status: 400, error: "Valid email required" };
  }

  const preview = [
    `Source: ${source} (${leadSourceLabel(source as LeadSource)})`,
    `Name: ${String(o.fullName ?? "").slice(0, 200)}`,
    `Email: ${email}`,
    `Phone: ${String(o.phone ?? o.phoneNumber ?? "").slice(0, 40)}`,
    `Event date: ${String(o.eventDate ?? o.preferredDate ?? "").slice(0, 40)}`,
    `Services: ${JSON.stringify(o.services ?? [])}`,
    `Events: ${JSON.stringify(o.events ?? [])}`,
    `Setting: ${JSON.stringify(o.setting ?? [])}`,
    `Notes: ${String(o.notes ?? o.specialRequests ?? "").slice(0, 2000)}`,
    `Enquiry page: ${String(o.enquiryPage ?? "").slice(0, 200)}`,
  ].join("\n");

  return { ok: true, email, preview };
}
