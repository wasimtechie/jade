"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import VillaDetailMeanderStrip from "./VillaDetailMeanderStrip";
import {
  VILLA_DETAIL_CHARCOAL,
  VILLA_DETAIL_GREEN,
  VILLA_DETAIL_SPACING,
} from "./villaDetailSpacing";

type VillaDetailSectionProps = {
  id?: string;
  variant?: "charcoal" | "green";
  children: ReactNode;
  className?: string;
  meanderTop?: boolean;
  meanderBottom?: boolean;
  meanderBottomAccent?: "green" | "none";
};

/** One scroll section with symmetric 8pt padding and a consistent inner stack. */
export default function VillaDetailSection({
  id,
  variant = "charcoal",
  children,
  className,
  meanderTop = false,
  meanderBottom = false,
  meanderBottomAccent = "none",
}: VillaDetailSectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        variant === "green" ? VILLA_DETAIL_GREEN : VILLA_DETAIL_CHARCOAL,
        className,
      )}
    >
      {meanderTop ? <VillaDetailMeanderStrip /> : null}
      <div className={VILLA_DETAIL_SPACING.sectionShell}>
        <div className={clsx(VILLA_DETAIL_SPACING.content, VILLA_DETAIL_SPACING.stack)}>
          {children}
        </div>
      </div>
      {meanderBottom ? (
        <VillaDetailMeanderStrip accentLine={meanderBottomAccent} />
      ) : null}
    </section>
  );
}

export function VillaDetailSectionHeading({
  children,
  as: Tag = "h3",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
}) {
  return <Tag className={VILLA_DETAIL_SPACING.heading}>{children}</Tag>;
}
