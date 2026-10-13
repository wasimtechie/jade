/**
 * Sends email via Resend SDK.
 * If RESEND_API_KEY is unset, callers should treat DB writes as source of truth and log.
 */

import { Resend } from "resend";

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
};

export type SendEmailInput = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<{ sent: boolean; reason?: string }> {
  const client = getResend();
  if (!client) {
    return { sent: false, reason: "RESEND_API_KEY not set" };
  }

  if (input.to.length === 0) {
    return { sent: false, reason: "No recipients" };
  }

  const from =
    process.env.RESEND_FROM?.trim() ||
    "Jade Hospitainment <onboarding@resend.dev>";

  const attachments = input.attachments?.map((a) => ({
    filename: a.filename,
    content:
      typeof a.content === "string" ? a.content : a.content.toString("base64"),
  }));

  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
    attachments: attachments?.length ? attachments : undefined,
  });

  if (error) {
    return {
      sent: false,
      reason:
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: string }).message).slice(0, 500)
          : "Resend send failed",
    };
  }

  return { sent: true };
}
