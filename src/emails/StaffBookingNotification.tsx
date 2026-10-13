import { Text } from "@react-email/components";
import { EmailButton } from "./components/EmailButton";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { EmailMessageBox } from "./components/EmailMessageBox";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type StaffBookingNotificationProps = {
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests?: number;
  guestMix?: string;
  totalInr: string;
  paymentStatus: string;
  paymentPlan?: string;
  sourceLabel: string;
  bookingType?: "stay" | "day_out" | "event";
  notes?: string;
  addOnsText?: string;
  pricingText?: string;
  dashboardUrl?: string;
};

export function StaffBookingNotificationEmail(
  props: StaffBookingNotificationProps,
) {
  const shortId = props.bookingId.slice(0, 8).toUpperCase();
  const rows = [
    { label: "Reference", value: shortId },
    { label: "Villa", value: props.villaName },
    { label: "Stay", value: `${props.checkIn} → ${props.checkOut}` },
    { label: "Guest", value: props.guestName },
    { label: "Email", value: props.guestEmail || "(not provided)" },
    { label: "Phone", value: props.guestPhone || "(not provided)" },
  ];
  if (props.guests != null) {
    rows.push({ label: "Guests", value: String(props.guests) });
  }
  rows.push(
    ...(props.guestMix ? [{ label: "Guest mix", value: props.guestMix }] : []),
    ...(props.bookingType ? [{ label: "Booking type", value: props.bookingType.replace(/_/g, " ") }] : []),
    { label: "Total", value: props.totalInr },
    { label: "Payment", value: props.paymentStatus },
    ...(props.paymentPlan ? [{ label: "Payment plan", value: props.paymentPlan }] : []),
    { label: "Source", value: props.sourceLabel },
  );

  return (
    <JadeEmailLayout
      preview={`Booking confirmed — ${props.villaName}`}
      eyebrow="Booking confirmed"
      title={props.villaName}
    >
      <Text style={intro}>
        A new stay is confirmed in Jade Host. Use reply-to on this thread to
        reach the guest.
      </Text>
      <EmailDetailTable rows={rows} />
      {props.addOnsText ? (
        <EmailMessageBox label="Selected add-ons" children={props.addOnsText} />
      ) : null}
      {props.pricingText ? (
        <EmailMessageBox label="Pricing breakdown" children={props.pricingText} />
      ) : null}
      {props.notes ? (
        <EmailMessageBox label="Guest notes" children={props.notes} />
      ) : null}
      {props.dashboardUrl ? (
        <>
          <Text style={ctaHint}>Full folio, payments, and notes in dashboard.</Text>
          <EmailButton href={props.dashboardUrl} label="Open booking folio" />
        </>
      ) : null}
      <Text style={finePrint}>Booking ID {props.bookingId}</Text>
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

const finePrint = {
  color: emailColors.textMuted,
  fontSize: "12px",
  margin: "20px 0 0",
};
