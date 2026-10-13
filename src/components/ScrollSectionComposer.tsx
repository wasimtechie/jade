"use client";

import { useRef, ReactNode, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  animate,
  MotionValue,
} from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import LiveBackground from "./LiveBackground";
import NavbarThemeTrigger from "./NavbarThemeTrigger";
import PrimaryButton from "./PrimaryButton";
import { useSafeBack } from "@/lib/safeBackNavigation";
import { ScrollLineIndicator } from "./ScrollLineIndicator";
import GoldAccentLine from "@/components/ui/GoldAccentLine";

export interface ScrollSlide {
  label?: string;
  lines: string[];
  button?: {
    label: string;
    href: string;
  };
}

interface ScrollSectionComposerProps {
  slides: ScrollSlide[];
  theme?: "golden" | "white";
  background?: ReactNode;
  height?: string; // e.g. "400vh"
  /** "early" — copy in by ~50% scroll, then holds locked before exit (philosophy) */
  fadeTiming?: "default" | "early";
  /** When false, all lines in a slide share the same scroll reveal window. */
  lineStagger?: boolean;
  /** Line 0 scroll-reveals; later lines auto-animate after this delay (ms). Home philosophy only. */
  lineStaggerDelayMs?: number;
  /**
   * `performance` — opacity/transform/scale only (no scroll-linked blur).
   * Blur filters force main-thread repaints and break 60fps with Lenis.
   */
  scrollEffects?: "full" | "performance";
  showNavigation?: boolean;
  /** Safe back target when showNavigation is enabled */
  backFallbackPath?: string;
  showScrollIndicator?: boolean;
  /** Footer-style gold accent at top and bottom of live-background scroll sections */
  showGoldAccents?: boolean;
  /** Horizontal gutters for slide copy (e.g. `px-4 md:px-8` to match premium card rails) */
  slideGutterClassName?: string;
  /** Outer width constraint for slide copy (e.g. `w-full max-w-7xl mx-auto`) */
  contentContainerClassName?: string;
}

const ScrollButton = ({ href, label }: { href: string; label: string }) => (
  <div className="pointer-events-auto">
    <PrimaryButton href={href} width="section">
      {label}
    </PrimaryButton>
  </div>
);

const LINE_REVEAL_DURATION_S = 0.42;
const LINE_REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Scroll-span fractions for live-background copy (130vh sections). Lower = faster fade-in. */
const EARLY_LABEL_FADE_SPAN = 0.07;
const EARLY_BODY_FADE_WIDTH_RATIO = 0.52;
const PHILOSOPHY_FADE_WIDTH = 0.14;
const PHILOSOPHY_LABEL_FADE_SPAN = 0.05;

function scrollRevealT(value: number, fadeInStart: number, fadeInEnd: number): number {
  if (value <= fadeInStart) return 0;
  if (value >= fadeInEnd) return 1;
  return (value - fadeInStart) / (fadeInEnd - fadeInStart);
}

const StaggeredLine = ({
  line,
  progress,
  fadeInStart,
  fadeInEnd,
}: {
  line: string;
  progress: MotionValue<number>;
  fadeInStart: number;
  fadeInEnd: number;
}) => {
  const opacity = useTransform(progress, [fadeInStart, fadeInEnd], [0, 1]);
  const y = useTransform(progress, [fadeInStart, fadeInEnd], [16, 0]);
  return (
    <motion.p
      className="m-0"
      style={{ opacity, y, willChange: "opacity, transform" }}
    >
      {line}
    </motion.p>
  );
};

/** Line 0 for timed philosophy pair — holds visible while line 2 exits on reverse. */
const PhilosophyLeadLine = ({
  line,
  progress,
  fadeInStart,
  fadeInEnd,
  followOpacity,
}: {
  line: string;
  progress: MotionValue<number>;
  fadeInStart: number;
  fadeInEnd: number;
  followOpacity: MotionValue<number>;
}) => {
  const opacity = useMotionValue(0);
  const y = useMotionValue(16);
  const prevProgress = useRef(0);

  useMotionValueEvent(progress, "change", (value) => {
    const reversing = value < prevProgress.current - 0.0005;
    prevProgress.current = value;

    if (value < fadeInStart - 0.012) {
      opacity.set(0);
      y.set(16);
      return;
    }

    if (reversing && followOpacity.get() > 0.02) {
      opacity.set(1);
      y.set(0);
      return;
    }

    const t = scrollRevealT(value, fadeInStart, fadeInEnd);
    opacity.set(t);
    y.set(16 * (1 - t));
  });

  return (
    <motion.p
      className="m-0"
      style={{ opacity, y, willChange: "opacity, transform" }}
    >
      {line}
    </motion.p>
  );
};

/** Scroll triggers line 0; follow-up lines animate in after a fixed delay. */
const TimedFollowLine = ({
  line,
  progress,
  triggerProgress,
  delayMs,
  lineIndex,
  opacityMV,
}: {
  line: string;
  progress: MotionValue<number>;
  triggerProgress: number;
  delayMs: number;
  lineIndex: number;
  opacityMV: MotionValue<number>;
}) => {
  const opacity = opacityMV;
  const y = useMotionValue(16);
  const armedRef = useRef(false);
  const revealedRef = useRef(false);
  const exitingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevProgress = useRef(0);
  const resetThreshold = triggerProgress - 0.012;

  const clearRevealTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetLine = () => {
    armedRef.current = false;
    revealedRef.current = false;
    exitingRef.current = false;
    clearRevealTimer();
    opacity.set(0);
    y.set(16);
  };

  const fadeOut = () => {
    if (exitingRef.current || opacity.get() < 0.02) return;
    exitingRef.current = true;
    clearRevealTimer();
    void Promise.all([
      animate(opacity, 0, {
        duration: LINE_REVEAL_DURATION_S,
        ease: LINE_REVEAL_EASE,
      }),
      animate(y, 16, {
        duration: LINE_REVEAL_DURATION_S,
        ease: LINE_REVEAL_EASE,
      }),
    ]).then(() => {
      exitingRef.current = false;
      armedRef.current = false;
      revealedRef.current = false;
    });
  };

  useMotionValueEvent(progress, "change", (value) => {
    const reversing = value < prevProgress.current - 0.0005;
    prevProgress.current = value;

    if (value < resetThreshold) {
      resetLine();
      return;
    }

    if (reversing) {
      if (revealedRef.current) {
        fadeOut();
      } else if (armedRef.current) {
        resetLine();
      }
      return;
    }

    if (!reversing && value >= triggerProgress && !armedRef.current && !exitingRef.current) {
      armedRef.current = true;
      clearRevealTimer();
      timerRef.current = setTimeout(() => {
        revealedRef.current = true;
        animate(opacity, 1, {
          duration: LINE_REVEAL_DURATION_S,
          ease: LINE_REVEAL_EASE,
        });
        animate(y, 0, {
          duration: LINE_REVEAL_DURATION_S,
          ease: LINE_REVEAL_EASE,
        });
      }, delayMs * lineIndex);
    }
  });

  useEffect(() => () => clearRevealTimer(), []);

  return (
    <motion.p
      className="m-0"
      style={{ opacity, y, willChange: "opacity, transform" }}
    >
      {line}
    </motion.p>
  );
};

const SlideLines = ({
  slide,
  progress,
  start,
  end,
  index,
  fadeTiming,
  scrollEffects,
  lineStagger = true,
  lineStaggerDelayMs,
  slideGutterClassName,
  contentContainerClassName,
}: {
  slide: ScrollSlide;
  progress: MotionValue<number>;
  start: number;
  end: number;
  index: number;
  totalSlides: number;
  fadeTiming: "default" | "early";
  scrollEffects: "full" | "performance";
  lineStagger: boolean;
  lineStaggerDelayMs?: number;
  slideGutterClassName: string;
  contentContainerClassName: string;
}) => {
  const span = end - start;
  const early = fadeTiming === "early";
  const philosophy = lineStaggerDelayMs != null;
  const followOpacity = useMotionValue(0);
  // Short live-background philosophy (130vh): tighter reveal + brief lock before exit.
  const lockExitFrac = philosophy ? 0.38 : early ? 0.14 : 0.1;
  const fadeOut = end - span * lockExitFrac;

  // Locking / Y parallax (slide-level enter & exit)
  const yInput =
    index === 0
      ? [start, fadeOut, end]
      : [start - span * 0.2, start, fadeOut, end];
  const yOutput = index === 0 ? [0, 0, -50] : [100, 0, 0, -80];

  const y = useTransform(progress, yInput, yOutput);

  // Slide-level: hold at full opacity through the lock window, fade only at end.
  const opacity = useTransform(progress, [start, fadeOut, end], [1, 1, 0]);
  const scale = useTransform(
    progress,
    [start, start + span * (philosophy ? 0.06 : early ? 0.08 : 0.2), fadeOut, end],
    [0.985, 1, 1, 0.995],
  );
  const useBlur = scrollEffects === "full";
  const blurPx = useTransform(
    progress,
    [start, start + span * (philosophy ? 0.06 : early ? 0.08 : 0.2), fadeOut, end],
    useBlur ? [6, 0, 0, 4] : [0, 0, 0, 0],
  );
  const blurFilter = useTransform(blurPx, (v) => `blur(${v}px)`);

  // Per-line fade-in: early = quick reveal, then idle until slide fade-out.
  const labelOffset = philosophy
    ? 0.03
    : early
      ? slide.label
        ? 0.04
        : 0.02
      : slide.label
        ? 0.15
        : 0.05;
  const tail = philosophy ? 0.1 : early ? 0.22 : 0.15;
  const lineCount = Math.max(slide.lines.length, 1);
  const perLineWindow = (1 - labelOffset - tail) / lineCount;
  const fadeWidth = philosophy
    ? PHILOSOPHY_FADE_WIDTH
    : perLineWindow * (early ? EARLY_BODY_FADE_WIDTH_RATIO : 0.85);

  const labelOpacity = useTransform(
    progress,
    [
      start + span * 0.01,
      start +
        span *
          (philosophy ? PHILOSOPHY_LABEL_FADE_SPAN : EARLY_LABEL_FADE_SPAN),
    ],
    [0, 1],
  );
  const labelY = useTransform(
    progress,
    [
      start + span * 0.01,
      start +
        span *
          (philosophy ? PHILOSOPHY_LABEL_FADE_SPAN : EARLY_LABEL_FADE_SPAN),
    ],
    [12, 0],
  );

  const buttonStart =
    start + span * (labelOffset + lineCount * perLineWindow + 0.04);
  const buttonEnd = Math.min(buttonStart + span * 0.12, fadeOut);
  const buttonOpacity = useTransform(
    progress,
    [buttonStart, buttonEnd],
    [0, 1],
  );

  return (
    <motion.div
      className={`absolute inset-x-0 flex items-center justify-center pointer-events-none ${slideGutterClassName}`}
      style={{ y }}
    >
      <motion.div
        className={`text-center w-full mb-10 ${contentContainerClassName}`}
        style={{
          opacity,
          scale,
          filter: useBlur ? blurFilter : undefined,
          willChange: useBlur ? "transform, filter, opacity" : "transform, opacity",
        }}
      >
        {slide.label && (
          <motion.p
            className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-5 md:mb-6 text-center"
            style={{ opacity: labelOpacity, y: labelY }}
          >
            {slide.label}
          </motion.p>
        )}

        <motion.div
          className={`font-manrope font-normal text-[16px] sm:text-[17px] md:text-[19px] leading-[1.7] md:leading-[1.75] tracking-[0.01em] text-[#FAFAFA]/90 max-w-[340px] sm:max-w-xl md:max-w-2xl mx-auto flex flex-col${slide.lines.length > 1 ? " gap-6 md:gap-7" : ""}${slide.button ? " mb-6 md:mb-8" : ""}`}
        >
          {slide.lines.map((line, lineIdx) => {
            const firstLineFadeInStart = start + span * labelOffset;
            const firstLineFadeInEnd = firstLineFadeInStart + span * fadeWidth;

            if (lineStaggerDelayMs && lineIdx === 0) {
              return (
                <PhilosophyLeadLine
                  key={`${line}-${lineIdx}`}
                  line={line}
                  progress={progress}
                  fadeInStart={firstLineFadeInStart}
                  fadeInEnd={firstLineFadeInEnd}
                  followOpacity={followOpacity}
                />
              );
            }

            if (lineStaggerDelayMs && lineIdx > 0) {
              return (
                <TimedFollowLine
                  key={`${line}-${lineIdx}`}
                  line={line}
                  progress={progress}
                  triggerProgress={firstLineFadeInStart}
                  delayMs={lineStaggerDelayMs}
                  lineIndex={lineIdx}
                  opacityMV={followOpacity}
                />
              );
            }

            const fadeInStart =
              start +
              span *
                (lineStagger
                  ? labelOffset + lineIdx * perLineWindow
                  : labelOffset);
            const fadeInEnd = fadeInStart + span * fadeWidth;
            return (
              <StaggeredLine
                key={`${line}-${lineIdx}`}
                line={line}
                progress={progress}
                fadeInStart={fadeInStart}
                fadeInEnd={fadeInEnd}
              />
            );
          })}
        </motion.div>

        {slide.button && (
          <motion.div
            className="pointer-events-auto"
            style={{ opacity: buttonOpacity }}
          >
            <ScrollButton href={slide.button.href} label={slide.button.label} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function ScrollSectionComposer({
  slides,
  theme = "golden",
  background = <LiveBackground />,
  height = "400vh",
  fadeTiming = "default",
  lineStagger = true,
  lineStaggerDelayMs,
  scrollEffects = "full",
  showNavigation = false,
  backFallbackPath = "/experiences",
  showScrollIndicator = true,
  showGoldAccents = true,
  slideGutterClassName = "px-6 md:px-12",
  contentContainerClassName = "max-w-[90vw] md:max-w-4xl mx-auto",
}: ScrollSectionComposerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const goBack = useSafeBack(backFallbackPath);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const total = slides.length;
  const segmentSpan = 1.0 / total;
  const gap = segmentSpan * 0.1;

  return (
    <div ref={containerRef} className="relative" style={{ height }}>
      {showGoldAccents ? (
        <GoldAccentLine className="relative z-[60]" />
      ) : null}
      <NavbarThemeTrigger theme={theme} sectionRef={containerRef} />

      <div className="sticky top-0 min-h-[100svh] lg:min-h-screen w-full overflow-hidden bg-[#050505]">
        {background}

        {/* Floating Icons - Only if showNavigation is true */}
        {showNavigation && (
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 md:p-12">
            <button
              type="button"
              onClick={goBack}
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" aria-hidden />
            </button>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {slides.map((slide, i) => {
            const start = i * segmentSpan;
            const end = i === total - 1 ? 1.0 : (i + 1) * segmentSpan - gap;

            return (
              <SlideLines
                key={i}
                slide={slide}
                progress={scrollYProgress}
                start={start}
                end={end}
                index={i}
                totalSlides={total}
                fadeTiming={fadeTiming}
                scrollEffects={scrollEffects}
                lineStagger={lineStagger}
                lineStaggerDelayMs={lineStaggerDelayMs}
                slideGutterClassName={slideGutterClassName}
                contentContainerClassName={contentContainerClassName}
              />
            );
          })}
        </div>

        {/* Scroll Indicator at the bottom */}
        {showScrollIndicator && (
          <ScrollLineIndicator floating />
        )}
      </div>
      {showGoldAccents ? (
        <GoldAccentLine className="absolute bottom-0 left-0 right-0 z-[60]" />
      ) : null}
    </div>
  );
}
