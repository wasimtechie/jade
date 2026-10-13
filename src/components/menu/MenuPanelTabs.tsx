"use client";

import Link from "next/link";
import clsx from "clsx";
import CategoryTabRail from "@/components/ui/CategoryTabRail";

export type MenuTabItem = { id: string; label: string; href: string };

export function MenuSectionChipTabs({
  tabs,
  bleedClassName = "",
  className = "",
}: {
  tabs: MenuTabItem[];
  bleedClassName?: string;
  className?: string;
}) {
  if (tabs.length === 0) return null;

  return (
    <CategoryTabRail
      withChrome
      fadeFrom="#1E2023"
      className={clsx(
        "sticky top-0 z-20 flex-shrink-0 bg-[#1E2023]/95 backdrop-blur-md border-b border-white/10 py-2.5 mb-4",
        className,
      )}
      trackClassName={clsx("gap-2 [scrollbar-width:thin]", bleedClassName)}
      trackAriaLabel="Section pages"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          data-tab-key={tab.id}
          role="tab"
          className="whitespace-nowrap flex-shrink-0 inline-flex items-center min-h-[44px] px-3 py-1.5 text-gh-label font-manrope font-medium transition-all duration-300 bg-transparent text-white/60 border border-white/20 hover:border-[#EFCD62] hover:text-[#EFCD62] hover:bg-[#EFCD62]/10 touch-manipulation"
        >
          {tab.label}
        </Link>
      ))}
    </CategoryTabRail>
  );
}

export function MenuVillasExperiencesSwitcher({
  active,
  onVillas,
  onExperiences,
  className = "",
}: {
  active: "villas" | "experiences";
  onVillas: () => void;
  onExperiences: () => void;
  className?: string;
}) {
  const itemClass = (selected: boolean) =>
    `flex-1 min-h-[44px] py-2.5 text-center text-gh-label font-manrope font-bold tracking-[0.15em] uppercase transition-colors border touch-manipulation ${selected ? "bg-[#EFCD62] text-[#1A1C1E] border-[#EFCD62]" : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white"}`;

  return (
    <div
      className={clsx("flex gap-2 flex-shrink-0 mb-5 min-w-0 w-full", className)}
      role="tablist"
      aria-label="Villas and experiences"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "villas"}
        data-tab-key="villas"
        className={itemClass(active === "villas")}
        onClick={onVillas}
      >
        Villas
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "experiences"}
        data-tab-key="experiences"
        className={itemClass(active === "experiences")}
        onClick={onExperiences}
      >
        Experiences
      </button>
    </div>
  );
}
