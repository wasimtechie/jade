"use client";

import type { ReactNode, Ref, RefObject } from "react";
import type { MotionValue } from "framer-motion";
import {
  scrollLinkedPanelAreaClass,
  scrollLinkedPanelAreaFeaturedClass,
  scrollLinkedSectionHeaderClass,
  scrollLinkedStickyStageClass,
  scrollLinkedStickyStageInnerClass,
} from "@/lib/scrollLinkedPanelLayout";
import {
  useScrollLinkedSectionProgress,
  type ScrollLinkedScrollMode,
} from "@/lib/useScrollLinkedSectionProgress";
import type { ScrollLinkedStageNavigation } from "@/lib/useScrollLinkedManualNavigation";
import { ScrollLinkedInteractiveStage } from "@/components/scroll-linked/ScrollLinkedInteractiveStage";
import {
  scrollLinkedMobileSnapEndZone,
  scrollLinkedMobileSnapMaxProgress,
  scrollLinkedMobileSnapPortion,
} from "@/lib/scrollLinkedMobileSnap";

export type ScrollLinkedHorizontalSectionProps = {
  sectionHeightVh?: number;
  bgClassName: string;
  headerLabel?: string;
  headerLabelClassName?: string;
  scrollMode?: ScrollLinkedScrollMode;
  stepCount?: number;
  smoothSpring?: boolean;
  endButton?: ReactNode | ((panelProgress: MotionValue<number>) => ReactNode);
  children: ReactNode | ((panelProgress: MotionValue<number>) => ReactNode);
  /** When set, skip outer section + hook (parent owns ref/progress). */
  embedded?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
  panelProgress?: MotionValue<number>;
  stageNavigation?: ScrollLinkedStageNavigation | null;
  /** Featured §6 — full mobile stage height (no header row). */
  panelAreaVariant?: "default" | "featured";
  /** Progress at which the end-of-section vertical scroll cue appears (default 0.82). */
  endZoneProgress?: number;
  /**
   * When false, `stepCount` is content cards only (no trailing CTA-only snap).
   * Default true — last step reserved for `endButton`.
   */
  hasEndCta?: boolean;
};

export function ScrollLinkedStickyStage({
  bgClassName,
  headerLabel,
  headerLabelClassName = "font-manrope text-gh-label tracking-[0.3em] uppercase font-semibold text-jade-gold drop-shadow-lg block",
  endButton,
  children,
  panelProgress,
  panelAreaClassName = scrollLinkedPanelAreaClass,
  stageNavigation = null,
  endZoneProgress,
}: {
  bgClassName: string;
  headerLabel?: string;
  headerLabelClassName?: string;
  endButton?: ReactNode | ((panelProgress: MotionValue<number>) => ReactNode);
  children: ReactNode | ((panelProgress: MotionValue<number>) => ReactNode);
  panelProgress: MotionValue<number>;
  panelAreaClassName?: string;
  stageNavigation?: ScrollLinkedStageNavigation | null;
  endZoneProgress?: number;
}) {
  const resolvedEndButton =
    typeof endButton === "function" ? endButton(panelProgress) : endButton;
  const resolvedChildren =
    typeof children === "function" ? children(panelProgress) : children;

  return (
    <ScrollLinkedInteractiveStage
      stageNavigation={stageNavigation}
      panelProgress={panelProgress}
      endZoneProgress={endZoneProgress}
      className={`${scrollLinkedStickyStageClass} ${scrollLinkedStickyStageInnerClass} ${bgClassName}`}
    >
      {headerLabel ? (
        <div className={scrollLinkedSectionHeaderClass}>
          <span className={headerLabelClassName}>{headerLabel}</span>
        </div>
      ) : null}
      <div className={panelAreaClassName}>{resolvedChildren}</div>
      {resolvedEndButton}
    </ScrollLinkedInteractiveStage>
  );
}

export default function ScrollLinkedHorizontalSection({
  sectionHeightVh,
  bgClassName,
  headerLabel,
  headerLabelClassName,
  scrollMode = "free",
  stepCount,
  smoothSpring,
  endButton,
  children,
  embedded = false,
  targetRef: externalRef,
  panelProgress: externalProgress,
  stageNavigation: externalStageNavigation,
  panelAreaVariant = "default",
  endZoneProgress,
  hasEndCta = true,
}: ScrollLinkedHorizontalSectionProps) {
  const panelAreaClassName =
    panelAreaVariant === "featured"
      ? scrollLinkedPanelAreaFeaturedClass
      : scrollLinkedPanelAreaClass;

  const cardStepCount = stepCount;
  const hookStepCount =
    scrollMode === "mobileSnapOnly" && cardStepCount != null
      ? cardStepCount + 1
      : cardStepCount;
  const panelCount =
    cardStepCount != null
      ? hasEndCta
        ? Math.max(1, cardStepCount - 1)
        : cardStepCount
      : undefined;
  const mobileSnapProgressOptions =
    scrollMode === "mobileSnapOnly" &&
    cardStepCount != null &&
    hookStepCount != null &&
    panelCount != null
      ? {
          mobileSnapZoneRatio: scrollLinkedMobileSnapPortion(hookStepCount),
          mobileSnapMaxProgress: hasEndCta
            ? scrollLinkedMobileSnapMaxProgress(panelCount, cardStepCount)
            : Math.max(0, (panelCount - 1) / Math.max(1, cardStepCount)),
          showHorizontalHint: false,
        }
      : {};

  const internal = useScrollLinkedSectionProgress({
    scrollMode,
    stepCount: hookStepCount,
    smoothSpring,
    ...mobileSnapProgressOptions,
  });

  const targetRef = externalRef ?? internal.targetRef;
  const panelProgress = externalProgress ?? internal.panelProgress;
  const stageNavigation =
    externalStageNavigation !== undefined
      ? externalStageNavigation
      : internal.stageNavigation;

  const resolvedEndZoneProgress =
    endZoneProgress ??
    (scrollMode === "mobileSnapOnly" &&
    cardStepCount != null &&
    panelCount != null
      ? hasEndCta
        ? scrollLinkedMobileSnapEndZone(panelCount, cardStepCount)
        : Math.max(0, (panelCount - 1) / Math.max(1, cardStepCount) - 0.02)
      : undefined);

  const stage = (
    <ScrollLinkedStickyStage
      bgClassName={bgClassName}
      headerLabel={headerLabel}
      headerLabelClassName={headerLabelClassName}
      endButton={endButton}
      panelProgress={panelProgress}
      panelAreaClassName={panelAreaClassName}
      stageNavigation={stageNavigation}
      endZoneProgress={resolvedEndZoneProgress}
    >
      {children}
    </ScrollLinkedStickyStage>
  );

  if (embedded) {
    return stage;
  }

  return (
    <section
      ref={targetRef as Ref<HTMLElement>}
      className={`relative ${bgClassName}`}
      style={sectionHeightVh ? { height: `${sectionHeightVh}vh` } : undefined}
    >
      {stage}
    </section>
  );
}
