import { Section, Text } from "@react-email/components";
import { emailColors, emailFonts } from "./emailTokens";

type EmailMessageBoxProps = {
  label: string;
  children: string;
};

export function EmailMessageBox({ label, children }: EmailMessageBoxProps) {
  return (
    <Section style={box}>
      <Text style={boxLabel}>{label}</Text>
      <Text style={boxBody}>{children || "(none)"}</Text>
    </Section>
  );
}

const box = {
  backgroundColor: emailColors.white,
  border: `1px solid ${emailColors.border}`,
  borderLeft: `4px solid ${emailColors.jadeGold}`,
  borderRadius: "2px",
  padding: "14px 18px",
  margin: "20px 0",
};

const boxLabel = {
  color: emailColors.textMuted,
  fontFamily: emailFonts.ui,
  fontSize: "11px",
  fontWeight: "600" as const,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

const boxBody = {
  color: emailColors.text,
  fontFamily: emailFonts.ui,
  fontSize: "15px",
  lineHeight: "1.55",
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};
