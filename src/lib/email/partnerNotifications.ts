import { createElement } from "react";
import { PartnerLeadNotificationEmail } from "@/emails/PartnerLeadNotification";
import {
  MAX_PARTNER_PHOTO_ATTACHMENTS,
  MAX_PARTNER_PHOTO_BYTES_EACH,
} from "@/lib/email/attachmentLimits";
import { renderEmail } from "@/lib/email/renderEmail";
import { sendTransactionalEmail } from "@/lib/email/resendOutbound";
import { getStaffNotifyRecipients } from "@/lib/email/staffRecipients";
import { getSiteBaseUrl } from "@/lib/siteUrl";
import { readFromGridFS } from "@/lib/storage/gridfs";

type PartnerPhotoRef = {
  gridFsId: string;
  filename: string;
};

export async function notifyPartnerLead(params: {
  partnerLeadId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  details: string;
  photos: PartnerPhotoRef[];
}): Promise<void> {
  const to = getStaffNotifyRecipients();
  if (to.length === 0) return;

  const attachments: { filename: string; content: Buffer }[] = [];
  for (const photo of params.photos.slice(0, MAX_PARTNER_PHOTO_ATTACHMENTS)) {
    const file = await readFromGridFS(photo.gridFsId, "partner_photos");
    if (!file || file.buffer.length > MAX_PARTNER_PHOTO_BYTES_EACH) continue;
    attachments.push({
      filename: photo.filename || file.filename,
      content: file.buffer,
    });
  }

  const rendered = await renderEmail(
    createElement(PartnerLeadNotificationEmail, {
      partnerLeadId: params.partnerLeadId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      company: params.company,
      details: params.details,
      photoCount: params.photos.length,
      photosAttached: attachments.length,
      dashboardUrl: `${getSiteBaseUrl()}/dashboard/leads`,
    }),
  );

  const r = await sendTransactionalEmail({
    to,
    subject: `[Jade partner] New partnership enquiry`,
    text: rendered.text,
    html: rendered.html,
    replyTo: params.email,
    attachments,
  });
  if (!r.sent) console.warn("[partner email]", r.reason);
}
