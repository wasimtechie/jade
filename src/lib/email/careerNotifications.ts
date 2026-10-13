import { createElement } from "react";
import { CareerApplicationNotificationEmail } from "@/emails/CareerApplicationNotification";
import { MAX_RESUME_ATTACHMENT_BYTES } from "@/lib/email/attachmentLimits";
import { renderEmail } from "@/lib/email/renderEmail";
import { sendTransactionalEmail } from "@/lib/email/resendOutbound";
import { getStaffNotifyRecipients } from "@/lib/email/staffRecipients";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { readFromGridFS } from "@/lib/storage/gridfs";

export async function notifyCareerApplication(params: {
  jobId: string;
  jobTitle: string;
  applyContext: string;
  sourcePage: string;
  applicantName: string;
  applicantEmail: string;
  applicationId: string;
  phone?: string;
  company?: string;
  resumeGridFsId?: string;
  resumeFilename?: string;
}): Promise<void> {
  const to = getStaffNotifyRecipients();
  if (to.length === 0) return;

  const attachments: { filename: string; content: Buffer }[] = [];
  let resumeAttached = false;

  if (params.resumeGridFsId) {
    const file = await readFromGridFS(params.resumeGridFsId, "resumes");
    if (file && file.buffer.length <= MAX_RESUME_ATTACHMENT_BYTES) {
      attachments.push({
        filename: params.resumeFilename || file.filename,
        content: file.buffer,
      });
      resumeAttached = true;
    }
  }

  const rendered = await renderEmail(
    createElement(CareerApplicationNotificationEmail, {
      applicationId: params.applicationId,
      jobTitle: params.jobTitle,
      jobId: params.jobId,
      applicantName: params.applicantName,
      applicantEmail: params.applicantEmail,
      phone: params.phone ?? "",
      company: params.company,
      dashboardUrl: `${getSiteBaseUrl()}/dashboard/careers`,
      resumeAttached,
    }),
  );

  const r = await sendTransactionalEmail({
    to,
    subject: `[Jade careers] ${params.jobTitle} — ${params.jobId}`,
    text: rendered.text,
    html: rendered.html,
    replyTo: params.applicantEmail,
    attachments,
  });
  if (!r.sent) console.warn("[careers email]", r.reason);
}
