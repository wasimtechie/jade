import { Text } from "@react-email/components";
import { EmailButton } from "./components/EmailButton";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { EmailMessageBox } from "./components/EmailMessageBox";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type LeadNotificationProps = {
  sourceLabel: string;
  name: string;
  email: string;
  phone: string;
  guests?: string;
  occasion?: string;
  enquiryPage?: string;
  interests?: string;
  message: string;
  preferredDate?: string;
  dashboardUrl?: string;
};

export function LeadNotificationEmail(props: LeadNotificationProps) {
  const rows = [
    { label: "Name", value: props.name },
    { label: "Email", value: props.email },
    { label: "Phone", value: props.phone },
  ];
  if (props.guests) {
    rows.push({ label: "Guest count", value: props.guests });
  }
  if (props.preferredDate) {
    rows.push({ label: "Preferred dates", value: props.preferredDate });
  }
  if (props.occasion) {
    rows.push({ label: "Occasion", value: props.occasion });
  }
  if (props.enquiryPage) {
    rows.push({ label: "Enquiry page", value: props.enquiryPage });
  }

  return (
    <JadeEmailLayout
      preview={`New enquiry — ${props.sourceLabel}`}
      eyebrow="New enquiry"
      title={props.sourceLabel}
    >
      <Text style={intro}>
        A guest submitted an enquiry on the website. Reply directly to their
        email address from your inbox.
      </Text>
      <EmailDetailTable rows={rows} />
      {props.interests ? (
        <EmailMessageBox label="Travel preferences" children={props.interests} />
      ) : null}
      <EmailMessageBox label="Message & details" children={props.message} />
      {props.dashboardUrl ? (
        <>
          <Text style={ctaHint}>Open the lead in Jade Host to follow up.</Text>
          <EmailButton href={props.dashboardUrl} label="View in dashboard" />
        </>
      ) : null}
    </JadeEmailLayout>
  );
}

const intro = {
  color: emailColors.text,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 4px",
};

const ctaHint = {
  color: emailColors.textMuted,
  fontSize: "14px",
  margin: "24px 0 0",
};
