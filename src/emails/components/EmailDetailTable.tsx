import { Section, Text } from "@react-email/components";
import { emailColors, emailFonts } from "./emailTokens";

export type DetailRow = {
  label: string;
  value: string;
};

type EmailDetailTableProps = {
  rows: DetailRow[];
};

export function EmailDetailTable({ rows }: EmailDetailTableProps) {
  return (
    <Section style={table}>
      {rows.map((row, i) => (
        <Section
          key={row.label}
          style={{
            ...rowStyle,
            borderBottom:
              i === rows.length - 1 ? "none" : rowStyle.borderBottom,
          }}
        >
          <Text style={label}>{row.label}</Text>
          <Text style={value}>{row.value || "—"}</Text>
        </Section>
      ))}
    </Section>
  );
}

const table = {
  backgroundColor: emailColors.surface,
  border: `1px solid ${emailColors.border}`,
  borderRadius: "4px",
  padding: "4px 0",
  margin: "20px 0",
};

const rowStyle = {
  padding: "10px 18px",
  borderBottom: `1px solid ${emailColors.border}`,
};

const label = {
  color: emailColors.textMuted,
  fontFamily: emailFonts.ui,
  fontSize: "11px",
  fontWeight: "600" as const,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const value = {
  color: emailColors.text,
  fontFamily: emailFonts.ui,
  fontSize: "15px",
  lineHeight: "1.45",
  margin: 0,
};
