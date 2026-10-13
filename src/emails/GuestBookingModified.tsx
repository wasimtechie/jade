import { Text } from "@react-email/components";
import { EmailDetailTable } from "./components/EmailDetailTable";
import { EmailMessageBox } from "./components/EmailMessageBox";
import { JadeEmailLayout } from "./components/JadeEmailLayout";
import { emailColors } from "./components/emailTokens";

export type GuestBookingModifiedProps = {
  guestName: string;
  bookingId: string;
  villaName: string;
  previousCheckIn: string;
  previousCheckOut: string;
  newCheckIn: string;
  newCheckOut: string;
  paymentStatus: string;
  paymentPlan?: string;
  previousTotalInr: string;
  newTotalInr: string;
  pricingDeltaLabel?: string;
  guestMix?: string;
  notes?: string;
  addOnsText?: string;
  pricingText?: string;
  contactPhone?: string;
  cancellationNote?: string;
};

export function GuestBookingModifiedEmail(props: GuestBookingModifiedProps) {
  const shortRef = props.bookingId.slice(0, 8).toUpperCase();

  return (
    <JadeEmailLayout
      preview={`Your stay dates at ${props.villaName} were updated`}
      eyebrow="Booking updated"
      title={`Your dates at ${props.villaName} have changed`}
    >
      <Text style={greeting}>Dear {props.guestName},</Text>
      <Text style={intro}>
        This is a modification notice — your private villa reservation has been
        updated by our team. Please review your new stay dates and totals below.
        This is not a new booking confirmation.
      </Text>
      <EmailDetailTable
        rows={[
          { label: "Reference", value: shortRef },
          { label: "Property", value: props.villaName },
          {
            label: "Previous dates",
            value: `${props.previousCheckIn} → ${props.previousCheckOut}`,
          },
          {
            label: "New dates",
            value: `${props.newCheckIn} → ${props.newCheckOut}`,
          },
          ...(props.guestMix
            ? [{ label: "Guest mix", value: props.guestMix }]
            : []),
          { label: "Payment", value: props.paymentStatus },
          ...(props.paymentPlan
            ? [{ label: "Payment plan", value: props.paymentPlan }]
            : []),
          { label: "Previous total", value: props.previousTotalInr },
          { label: "New total", value: props.newTotalInr },
          ...(props.pricingDeltaLabel
            ? [{ label: "Price change", value: props.pricingDeltaLabel }]
            : []),
        ]}
      />
      {props.addOnsText ? (
        <EmailMessageBox label="Selected add-ons" children={props.addOnsText} />
      ) : null}
      {props.pricingText ? (
        <EmailMessageBox label="Updated pricing" children={props.pricingText} />
      ) : null}
      {props.notes ? (
        <EmailMessageBox label="Special notes" children={props.notes} />
      ) : null}
      {props.contactPhone ? (
        <Text style={contact}>
          Questions about this change? Call us at{" "}
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
