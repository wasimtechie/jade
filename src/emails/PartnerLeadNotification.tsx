import { Text } from "@react-email/components";
import { EmailButton } from "./components/EmailButton";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { EmailMessageBox } from "./components/EmailMessageBox";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type PartnerLeadNotificationProps = {
  partnerLeadId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  details: string;
  photoCount: number;
  photosAttached: number;
  dashboardUrl?: string;
};

export function PartnerLeadNotificationEmail(props: PartnerLeadNotificationProps) {
  return (
    <JadeEmailLayout
      preview="New partner programme enquiry"
      eyebrow="Partner programme"
      title="New partnership enquiry"
    >
      <Text style={intro}>
        Someone submitted the Partner with us form, including property photos.
      </Text>
      <EmailDetailTable
        rows={[
          { label: "Lead ID", value: props.partnerLeadId },
          { label: "Name", value: props.name },
          { label: "Email", value: props.email },
          { label: "Phone", value: props.phone },
          { label: "Company", value: props.company },
          {
            label: "Photos",
            value:
              props.photoCount > 0
                ? `${props.photoCount} uploaded${
                    props.photosAttached > 0
                      ? ` · ${props.photosAttached} attached here`
                      : ""
                  }`
                : "—",
          },
        ]}
      />
      <EmailMessageBox label="Partnership details" children={props.details} />
      {props.dashboardUrl ? (
        <EmailButton href={props.dashboardUrl} label="View partner lead" />
      ) : null}
    </JadeEmailLayout>
  );
}

const intro = {
  color: emailColors.text,
  fontSize: "15px",
  margin: "0 0 4px",
};
