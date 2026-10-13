import { Text } from "@react-email/components";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { EmailMessageBox } from "./components/EmailMessageBox";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type GuestBookingConfirmationProps = {
  guestName: string;
  bookingId: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  paymentStatus: string;
  paymentPlan?: string;
  totalInr: string;
  guestMix?: string;
  notes?: string;
  addOnsText?: string;
  pricingText?: string;
  contactPhone?: string;
  mapsUrl?: string;
  cancellationNote?: string;
};

export function GuestBookingConfirmationEmail(
  props: GuestBookingConfirmationProps,
) {
  const shortRef = props.bookingId.slice(0, 8).toUpperCase();

  return (
    <JadeEmailLayout
      preview={`Your stay at ${props.villaName} is confirmed`}
      eyebrow="Booking confirmed"
      title={`See you at ${props.villaName}`}
    >
      <Text style={greeting}>Dear {props.guestName},</Text>
      <Text style={intro}>
        Thank you for choosing Jade Retreats. Your private villa reservation is
        confirmed — we look forward to hosting you.
      </Text>
      <EmailDetailTable
        rows={[
          { label: "Reference", value: shortRef },
          { label: "Property", value: props.villaName },
          { label: "Check-in", value: props.checkIn },
          { label: "Check-out", value: props.checkOut },
          ...(props.guestMix ? [{ label: "Guest mix", value: props.guestMix }] : []),
          { label: "Payment", value: props.paymentStatus },
          ...(props.paymentPlan ? [{ label: "Payment plan", value: props.paymentPlan }] : []),
          { label: "Total", value: props.totalInr },
        ]}
      />
      {props.addOnsText ? (
        <EmailMessageBox label="Selected add-ons" children={props.addOnsText} />
      ) : null}
      {props.pricingText ? (
        <EmailMessageBox label="Pricing breakdown" children={props.pricingText} />
      ) : null}
      {props.notes ? (
        <EmailMessageBox label="Special notes" children={props.notes} />
      ) : null}
      {props.mapsUrl ? (
        <Text style={linkLine}>
          <strong>Directions:</strong>{" "}
          <a href={props.mapsUrl} style={link}>
            View on Google Maps
          </a>
        </Text>
      ) : null}
      {props.contactPhone ? (
        <Text style={contact}>
          Questions before you arrive? Call us at{" "}
          <a href={`tel:${props.contactPhone.replace(/\s/g, "")}`} style={link}>
            {props.contactPhone}
          </a>
          .
        </Text>
      ) : null}
      {props.cancellationNote ? (
        <Text style={finePrint}>{props.cancellationNote}</Text>
      ) : null}
      <Text style={signoff}>Warm regards,</Text>
      <Text style={signoffName}>The Jade Retreats team</Text>
    </JadeEmailLayout>
  );
}

const greeting = {
  color: emailColors.text,
  fontSize: "16px",
  margin: "0 0 12px",
};

const intro = {
  color: emailColors.text,
  fontSize: "15px",
  lineHeight: "1.65",
  margin: "0 0 8px",
};

const linkLine = {
  fontSize: "14px",
  margin: "16px 0 0",
};

const link = {
  color: emailColors.jadeGreen,
};

const contact = {
  fontSize: "15px",
  margin: "16px 0 0",
};

const finePrint = {
  fontSize: "13px",
  color: emailColors.textMuted,
  lineHeight: "1.5",
  margin: "20px 0 0",
};

const signoff = {
  fontSize: "15px",
  margin: "28px 0 4px",
};

const signoffName = {
  fontSize: "15px",
  color: emailColors.jadeDeep,
  fontWeight: "600" as const,
  margin: 0,
};
