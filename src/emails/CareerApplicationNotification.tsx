import { Text } from "@react-email/components";
import { EmailButton } from "./components/EmailButton";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type CareerApplicationNotificationProps = {
  applicationId: string;
  jobTitle: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  company?: string;
  dashboardUrl?: string;
  resumeAttached: boolean;
};

export function CareerApplicationNotificationEmail(
  props: CareerApplicationNotificationProps,
) {
  const rows = [
    { label: "Application ID", value: props.applicationId },
    { label: "Role", value: `${props.jobTitle} (${props.jobId})` },
    { label: "Name", value: props.applicantName },
    { label: "Email", value: props.applicantEmail },
    { label: "Phone", value: props.phone },
  ];
  if (props.company) {
    rows.push({ label: "Company", value: props.company });
  }

  return (
    <JadeEmailLayout
      preview={`Careers application — ${props.jobTitle}`}
      eyebrow="Careers"
      title={props.jobTitle}
    >
      <Text style={intro}>A new job application was submitted on the careers page.</Text>
      <EmailDetailTable rows={rows} />
      <Text style={attachNote}>
        {props.resumeAttached
          ? "The candidate's résumé is attached to this email."
          : "Download the résumé from the dashboard."}
      </Text>
      {props.dashboardUrl ? (
        <EmailButton href={props.dashboardUrl} label="View application" />
      ) : null}
    </JadeEmailLayout>
  );
}

const intro = {
  color: emailColors.text,
  fontSize: "15px",
  margin: "0 0 4px",
};

const attachNote = {
  color: emailColors.textMuted,
  fontSize: "14px",
  margin: "16px 0 8px",
};
