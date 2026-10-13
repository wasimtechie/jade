"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: ReactNode;
  headline: string;
  subtext?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({
  icon,
  headline,
  subtext,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-5 py-12 md:py-20 text-center px-8 bg-white/[0.02] border border-white/5 rounded-md max-w-xl mx-auto shadow-2xl"
    >
      {icon && (
        <div className="w-16 h-16 text-jade-gold flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-full p-4 mb-2 shadow-[0_0_20px_rgba(239,205,98,0.05)]">
          {icon}
        </div>
      )}
      <h3 className="text-white font-philosopher text-gh-h2 leading-tight">
        {headline}
      </h3>
      {subtext && (
        <p className="text-white/60 font-manrope text-gh-body max-w-md leading-relaxed">
          {subtext}
        </p>
      )}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-3 bg-[#EFCD62] text-[#0B2C23] font-manrope font-bold text-gh-label tracking-widest uppercase px-10 py-4 hover:bg-white hover:text-black transition-all rounded-sm duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          {ctaLabel}
        </button>
      )}
    </motion.div>
  );
}
