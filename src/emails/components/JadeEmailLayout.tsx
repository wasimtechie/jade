import {
  Link,
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { getEmailSiteBaseUrl } from "@/lib/siteUrl";
import { emailColors, emailFonts } from "./emailTokens";

type JadeEmailLayoutProps = {
  preview: string;
  title: string;
  /** Small caps label above title, e.g. "Staff alert" */
  eyebrow?: string;
  children: ReactNode;
};

export function JadeEmailLayout({
  preview,
  title,
  eyebrow = "Jade Retreats",
  children,
}: JadeEmailLayoutProps) {
  /** Guest-facing links must match Resend sending domain — never localhost. */
  const siteBaseUrl = getEmailSiteBaseUrl();

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={outer}>
          <Section style={header}>
            <Text style={brand}>JADE RETREATS</Text>
            <Text style={brandSub}>Hospitainment</Text>
          </Section>
          <Container style={card}>
            {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
            <Heading style={heading}>{title}</Heading>
            <Section style={content}>{children}</Section>
            <Hr style={hr} />
            <Text style={policyLinks}>
              <Link href={`${siteBaseUrl}/privacy-policy`} style={footerLink}>
                Privacy Policy
              </Link>{" "}
              ·{" "}
              <Link href={`${siteBaseUrl}/terms-conditions`} style={footerLink}>
                Terms &amp; Conditions
              </Link>{" "}
              ·{" "}
              <Link href={`${siteBaseUrl}/refund-policy`} style={footerLink}>
                Refund Policy
              </Link>
            </Text>
            <Text style={footer}>
              Jade Hospitainment ·{" "}
              <a href={siteBaseUrl} style={footerLink}>
                jaderetreats.com
              </a>
            </Text>
            <Text style={footerMuted}>
              This is an automated message from Jade Host PMS.
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: emailColors.surface,
  margin: 0,
  padding: "24px 12px",
  fontFamily: emailFonts.ui,
};

const outer = {
  maxWidth: "600px",
  margin: "0 auto",
};

const header = {
  backgroundColor: emailColors.jadeDeep,
  padding: "28px 32px 24px",
  borderRadius: "4px 4px 0 0",
  borderBottom: `3px solid ${emailColors.jadeGold}`,
};

const brand = {
  color: emailColors.jadeGold,
  fontFamily: emailFonts.sans,
  fontSize: "22px",
  fontWeight: "400" as const,
  letterSpacing: "0.2em",
  margin: "0 0 4px",
};

const brandSub = {
  color: "rgba(255,255,255,0.75)",
  fontFamily: emailFonts.ui,
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  margin: 0,
};

const card = {
  backgroundColor: emailColors.white,
  padding: "32px 28px 24px",
  borderRadius: "0 0 4px 4px",
  border: `1px solid ${emailColors.border}`,
  borderTop: "none",
};

const eyebrowStyle = {
  color: emailColors.jadeGreen,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

const heading = {
  color: emailColors.jadeDeep,
  fontFamily: emailFonts.sans,
  fontSize: "26px",
  fontWeight: "400" as const,
  lineHeight: "1.25",
  margin: "0 0 16px",
};

const content = {
  color: emailColors.text,
  fontSize: "15px",
  lineHeight: "1.6",
};

const hr = {
  borderColor: emailColors.border,
  margin: "28px 0 16px",
};

const footer = {
  color: emailColors.textMuted,
  fontSize: "13px",
  margin: "0 0 6px",
};

const policyLinks = {
  color: emailColors.textMuted,
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const footerLink = {
  color: emailColors.jadeGreen,
  textDecoration: "underline",
};

const footerMuted = {
  color: "#9a9a9a",
  fontSize: "11px",
  margin: 0,
};
