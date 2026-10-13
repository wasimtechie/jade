import { Section, Text } from "@react-email/components";
import { EmailButton } from "./components/EmailButton";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type BookingConflictNotificationProps = {
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  source: string;
  reason?: string;
  conflictsUrl?: string;
};

export function BookingConflictNotificationEmail(
  props: BookingConflictNotificationProps,
) {
  return (
    <JadeEmailLayout
      preview={`Booking conflict — ${props.villaName}`}
      eyebrow="Action required"
      title={`Conflict at ${props.villaName}`}
    >
      <Section style={alertBanner}>
        <Text style={alertText}>
          Two bookings overlap for the same villa dates. Resolve in Jade Host
          before guests are affected.
        </Text>
      </Section>
      <EmailDetailTable
        rows={[
          { label: "Booking ID", value: props.bookingId },
          { label: "Villa", value: props.villaName },
          { label: "Dates", value: `${props.checkIn} → ${props.checkOut}` },
          { label: "Guest", value: props.guestName },
          { label: "Source", value: props.source },
          ...(props.reason
            ? [{ label: "Reason", value: props.reason }]
            : []),
        ]}
      />
      {props.conflictsUrl ? (
        <EmailButton href={props.conflictsUrl} label="Resolve conflict" />
      ) : (
        <Text style={fallback}>Open Dashboard → Conflicts to resolve.</Text>
      )}
    </JadeEmailLayout>
  );
}

const alertBanner = {
  backgroundColor: emailColors.alertBg,
  border: `1px solid #e8c4c4`,
  borderRadius: "4px",
  padding: "14px 18px",
  margin: "0 0 8px",
};

const alertText = {
  color: emailColors.alert,
  fontSize: "14px",
  lineHeight: "1.5",
  margin: 0,
};

const fallback = {
  color: emailColors.textMuted,
  fontSize: "14px",
  margin: "16px 0 0",
};
