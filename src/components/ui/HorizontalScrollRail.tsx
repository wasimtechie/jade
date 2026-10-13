"use client";

import clsx from "clsx";
import { forwardRef, type AriaRole, type ReactNode, useMemo, useRef } from "react";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";
import { JADE_HSCROLL_DATA_ATTR } from "@/lib/horizontalScrollClasses";
import { HORIZONTAL_RAIL_DRAG_GAIN } from "@/lib/hscrollSensitivity";

const vd = VILLA_DETAIL_SPACING;

export type HorizontalScrollRailProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  /** @deprecated Use section bg #1A1C1E — fade uses global Figma gradient */
  fadeFrom?: string;
  showFade?: boolean;
  /** Wider right-edge fade (category bars); no decorative pattern */
  patternFade?: boolean;
  /** Mobile: viewport edge-to-edge */
  mobileViewportEdge?: boolean;
  /** All breakpoints: 100vw bleed (spaces galleries, category nav) */
  viewportEdgeAll?: boolean;
  mobileTrackGutter?: boolean;
  /** Open-hand cursor on horizontal scroll track */
  cursorGrab?: boolean;
  /** When true, lock gesture axis so vertical swipes reach parent scroll (menu mobile rails). */
  nestedVerticalScroll?: boolean;
  trackRole?: AriaRole;
  trackAriaLabel?: string;
};

const HorizontalScrollRail = forwardRef<HTMLDivElement, HorizontalScrollRailProps>(
  function HorizontalScrollRail(
    {
      children,
      className,
      trackClassName,
      showFade = true,
      patternFade = false,
      mobileViewportEdge = false,
      viewportEdgeAll = false,
      mobileTrackGutter = false,
      cursorGrab = false,
      nestedVerticalScroll = false,
      trackRole,
      trackAriaLabel,
    },
    ref,
  ) {
    const DRAG_THRESHOLD_PX = 5;

    const drag = useRef<{
      pending: boolean;
      dragging: boolean;
      pointerId: number | null;
      startX: number;
      startY: number;
      startScrollLeft: number;
    }>({
      pending: false,
      dragging: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startScrollLeft: 0,
    });

    const suppressClickRef = useRef(false);

    const endDrag = (el: HTMLDivElement, pointerId: number) => {
      drag.current.pending = false;
      drag.current.dragging = false;
      drag.current.pointerId = null;
      try {
        el.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
      document.body.style.userSelect = "";
    };

    const dragHandlers = useMemo(() => {
      if (!cursorGrab) return {};

      return {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!cursorGrab) return;
          if (e.pointerType === "mouse" && e.button !== 0) return;
          if (nestedVerticalScroll && e.pointerType !== "mouse") return;
          const el = e.currentTarget;
          drag.current.pending = true;
          drag.current.dragging = false;
          drag.current.pointerId = e.pointerId;
          drag.current.startX = e.clientX;
          drag.current.startY = e.clientY;
          drag.current.startScrollLeft = el.scrollLeft;
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!drag.current.pending && !drag.current.dragging) return;
          if (
            drag.current.pointerId !== null &&
            drag.current.pointerId !== e.pointerId
          ) {
            return;
          }
          const el = e.currentTarget;
          const dx = e.clientX - drag.current.startX;
          const dy = e.clientY - drag.current.startY;

          if (!drag.current.dragging) {
            if (
              Math.abs(dx) < DRAG_THRESHOLD_PX &&
              Math.abs(dy) < DRAG_THRESHOLD_PX
            ) {
              return;
            }
            if (nestedVerticalScroll && Math.abs(dy) >= Math.abs(dx)) {
              drag.current.pending = false;
              drag.current.pointerId = null;
              return;
            }
            if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
            drag.current.dragging = true;
            e.preventDefault();
            e.stopPropagation();
            el.setPointerCapture(e.pointerId);
            document.body.style.userSelect = "none";
          }

          el.scrollLeft = drag.current.startScrollLeft - dx * HORIZONTAL_RAIL_DRAG_GAIN;
        },
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!drag.current.pending && !drag.current.dragging) return;
          if (drag.current.dragging) {
            suppressClickRef.current = true;
            endDrag(e.currentTarget, e.pointerId);
            return;
          }
          drag.current.pending = false;
          drag.current.pointerId = null;
        },
        onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => {
          if (!suppressClickRef.current) return;
          e.preventDefault();
          e.stopPropagation();
          suppressClickRef.current = false;
        },
        onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!drag.current.pending && !drag.current.dragging) return;
          endDrag(e.currentTarget, e.pointerId);
        },
        onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => {
          if (!drag.current.dragging) return;
          if (e.pointerType === "mouse") {
            endDrag(e.currentTarget, e.pointerId);
          }
        },
      };
    }, [cursorGrab, nestedVerticalScroll]);

    return (
      <div
        className={clsx(
          "relative min-w-0 w-full",
          viewportEdgeAll && "jade-hscroll-viewport--edge-all",
          mobileViewportEdge && !viewportEdgeAll && vd.hScrollViewportEdge,
          className,
        )}
      >
        <div
          ref={ref}
          role={trackRole}
          aria-label={trackAriaLabel}
          {...{ [JADE_HSCROLL_DATA_ATTR]: "" }}
          className={clsx(
            "jade-hscroll-track flex overflow-x-auto min-w-0 overscroll-x-contain",
            mobileTrackGutter && vd.hScrollTrackMobileGutter,
            cursorGrab && "cursor-grab active:cursor-grabbing",
            trackClassName,
          )}
          {...dragHandlers}
        >
          {children}
        </div>
        {showFade ? (
          <div
            aria-hidden
            className={clsx(
              "jade-hscroll-fade",
              patternFade && "jade-hscroll-fade--wide",
            )}
          />
        ) : null}
      </div>
    );
  },
);

export default HorizontalScrollRail;
