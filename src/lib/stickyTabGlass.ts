import clsx from "clsx";

const tabBase =
  "shrink-0 inline-flex items-center min-h-[44px] px-4 py-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold font-manrope whitespace-nowrap rounded-none border transition-all touch-manipulation";

/** Active: match PrimaryButton (BOOK VILLA) — solid gold, dark text, inset-style stroke color. */
const tabActive =
  "border-[#AC8831] text-black bg-[#EFCD62] shadow-none hover:bg-[#dfbd52]";

/** Inactive: transparent; hover gets faint glass. */
const tabInactive =
  "border-transparent bg-transparent text-white/75 backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.06] hover:text-white";

export function stickyCategoryTabClass(isActive: boolean): string {
  return clsx(tabBase, isActive ? tabActive : tabInactive);
}
