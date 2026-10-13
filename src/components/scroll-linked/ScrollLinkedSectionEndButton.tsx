"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import PrimaryButton from "@/components/PrimaryButton";
import { useMediaMinLg } from "@/lib/useMediaMinLg";
import { scrollLinkedMobileSnapMaxProgress } from "@/lib/scrollLinkedMobileSnap";

type ScrollLinkedSectionEndButtonProps = {
  panelProgress: MotionValue<number>;
  panelCount: number;
  cardStepCount: number;
  href: string;
  label: string;
  className?: string;
};

/** Full-screen end CTA overlay — fades in on the final snap step (mobile) or late scroll (desktop). */
export default function ScrollLinkedSectionEndButton({
  panelProgress,
  panelCount,
  cardStepCount,
  href,
  label,
  className = "shadow-[0_16px_40px_rgba(239,205,98,0.4)] hover:shadow-[0_20px_50px_rgba(239,205,98,0.6)] transition-transform duration-300 hover:scale-[1.03]",
}: ScrollLinkedSectionEndButtonProps) {
  const isLg = useMediaMinLg();
  const endAt = scrollLinkedMobileSnapMaxProgress(panelCount, cardStepCount);
  const fadeStart = isLg ? 0.85 : Math.max(0, endAt - 0.08);
  const fadeEnd = isLg ? 1 : endAt;

  const opacity = useTransform(panelProgress, [fadeStart, fadeEnd], [0, 1]);
  const scale = useTransform(panelProgress, [fadeStart, fadeEnd], [0.8, 1]);
  const y = useTransform(panelProgress, [fadeStart, fadeEnd], [60, 0]);

  return (
    <motion.div
      style={{ opacity, scale, y, zIndex: 100 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="pointer-events-auto">
        <PrimaryButton href={href} width="section" className={className}>
          <span className="font-bold whitespace-nowrap text-center">{label}</span>
        </PrimaryButton>
      </div>
    </motion.div>
  );
}
