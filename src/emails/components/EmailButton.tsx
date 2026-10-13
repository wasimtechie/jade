import { Button } from "@react-email/components";
import { emailColors, emailFonts } from "./emailTokens";

type EmailButtonProps = {
  href: string;
  label: string;
};

export function EmailButton({ href, label }: EmailButtonProps) {
  return (
    <Button href={href} style={button}>
      {label}
    </Button>
  );
}

const button = {
  backgroundColor: emailColors.jadeGold,
  color: emailColors.jadeDeep,
  fontFamily: emailFonts.ui,
  fontSize: "14px",
  fontWeight: "700" as const,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  borderRadius: "2px",
  padding: "14px 28px",
  display: "inline-block",
  marginTop: "8px",
};
