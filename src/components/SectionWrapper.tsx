"use client";

import {
  forwardRef,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import LuxuryPattern, { type LuxuryPatternProps } from "./LuxuryPattern";
import { shouldDeferParallaxPatternToStickyStage } from "@/lib/backgroundAttachmentSupport";

export interface SectionWrapperProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Sets --section-bg on the shell */
  bg: string;
  children: ReactNode;
  pattern?: boolean | Omit<LuxuryPatternProps, "className">;
}

const SectionWrapper = forwardRef<HTMLElement | null, SectionWrapperProps>(
  (
    { bg, children, pattern = false, className = "", style, ...rest },
    ref,
  ) => {
    const shellStyle: CSSProperties = {
      ...style,
      backgroundColor: bg,
      ["--section-bg" as string]: bg,
    };

    const uniqueId = useId().replace(/:/g, "");
    const patternProps =
      pattern === true
        ? { patternId: `jade-lp-${uniqueId}` }
        : pattern === false
          ? null
          : { patternId: `jade-lp-${uniqueId}`, ...pattern };

    const deferPattern =
      patternProps !== null &&
      shouldDeferParallaxPatternToStickyStage(patternProps.parallaxFixed);

    return (
      <section
        ref={ref}
        className={`relative ${className}`}
        style={shellStyle}
        {...rest}
      >
        {patternProps !== null && !deferPattern && (
          <LuxuryPattern {...patternProps} />
        )}
        {children}
      </section>
    );
  },
);

SectionWrapper.displayName = "SectionWrapper";

export type { LuxuryPatternProps as SectionWrapperPatternProps };

export default SectionWrapper;
