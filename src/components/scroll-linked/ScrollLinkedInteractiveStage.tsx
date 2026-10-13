"use client";

import type { PanInfo } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { ReactNode, Ref } from "react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { ScrollLinkedStageNavigation } from "@/lib/useScrollLinkedManualNavigation";
import { ScrollLinkedHorizontalHint } from "@/components/scroll-linked/ScrollLinkedHorizontalHint";
import { ScrollLinkedVerticalHint } from "@/components/scroll-linked/ScrollLinkedVerticalHint";

const DEFAULT_END_ZONE_PROGRESS = 0.82;

type ScrollLinkedInteractiveStageProps = {
  children: ReactNode;
  stageNavigation: ScrollLinkedStageNavigation | null;
  className?: string;
  panelProgress?: MotionValue<number>;
  /** Progress at which the end-of-section (vertical scroll) cue appears. */
  endZoneProgress?: number;
};

type StageShellProps = {
  children: ReactNode;
  className?: string;
  stageNavigation: ScrollLinkedStageNavigation;
  panelProgress?: MotionValue<number>;
  endZoneProgress: number;
};

function ScrollLinkedInteractiveStageShell({
  children,
  className,
  stageNavigation,
  panelProgress,
  endZoneProgress,
}: StageShellProps) {
  const {
    stageRef,
    onPanStart,
    onPan,
    onPanEnd,
    showHint,
    showVerticalHint,
    dismissHint,
    isDragging,
  } = stageNavigation;

  const [inEndZone, setInEndZone] = useState(false);

  useEffect(() => {
    if (!panelProgress) return;
    const onChange = (value: number) => {
      const enteringEnd = value >= endZoneProgress;
      setInEndZone(enteringEnd);
      if (enteringEnd) {
        dismissHint();
      }
    };
    onChange(panelProgress.get());
    return panelProgress.on("change", onChange);
  }, [panelProgress, dismissHint, endZoneProgress]);

  return (
    <motion.div
      ref={stageRef as Ref<HTMLDivElement>}
      className={clsx(
        className,
        "relative touch-pan-y select-none max-lg:cursor-default",
        isDragging ? "cursor-grabbing" : "max-lg:cursor-default lg:cursor-grab",
      )}
      onPanStart={(event) => onPanStart(event as PointerEvent)}
      onPan={(event, info: PanInfo) => onPan(event as PointerEvent, info)}
      onPanEnd={onPanEnd}
    >
      {children}
      {showHint && !inEndZone ? <ScrollLinkedHorizontalHint /> : null}
      {showVerticalHint && inEndZone ? <ScrollLinkedVerticalHint /> : null}
    </motion.div>
  );
}

/**
 * Wraps the scroll-linked sticky stage. Horizontal grab / swipe / trackpad gestures
 * are translated into vertical scroll (see useScrollLinkedManualNavigation) — the stage
 * itself never transforms, so clickable cards still work and there is no jump/snap.
 */
export function ScrollLinkedInteractiveStage({
  children,
  stageNavigation,
  className,
  panelProgress,
  endZoneProgress = DEFAULT_END_ZONE_PROGRESS,
}: ScrollLinkedInteractiveStageProps) {
  if (!stageNavigation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <ScrollLinkedInteractiveStageShell
      className={className}
      stageNavigation={stageNavigation}
      panelProgress={panelProgress}
      endZoneProgress={endZoneProgress}
    >
      {children}
    </ScrollLinkedInteractiveStageShell>
  );
}
