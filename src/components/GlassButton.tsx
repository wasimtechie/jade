"use client";

import React from "react";
import { GlassChromeButtonPanel } from "./GlassChromePanel";
import { JADE_BTN_HEIGHT } from "@/lib/jadeButtonTokens";

interface GlassButtonProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const GlassButton = ({
  icon,
  label,
  onClick,
  className = "",
}: GlassButtonProps) => {
  return (
    <GlassChromeButtonPanel
      onClick={onClick}
      className={`box-border flex w-full flex-1 md:w-auto md:flex-initial md:min-w-[172px] transition-colors hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${JADE_BTN_HEIGHT} ${className}`.trim()}
      contentClassName="items-center justify-center gap-2.5 px-3 font-manrope text-gh-label font-bold uppercase tracking-[0.2em] text-white sm:px-6 whitespace-nowrap"
    >
      {icon}
      <span>{label}</span>
    </GlassChromeButtonPanel>
  );
};

export default GlassButton;
