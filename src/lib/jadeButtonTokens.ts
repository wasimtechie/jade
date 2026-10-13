/**
 * Jade global button tokens — single height + width profiles for CTAs.
 * Navbar chrome (44px) is the documented exception via JADE_BTN_CHROME_HEIGHT.
 */

/** Standard CTA height — forms, modals, sections, success OKAY. */
export const JADE_BTN_HEIGHT_PX = 48;
export const JADE_BTN_HEIGHT = "h-[48px] min-h-[48px] py-0";

/** Navbar BOOK + icon row alignment only. */
export const JADE_BTN_CHROME_HEIGHT =
  "h-11 min-h-[44px] max-h-[44px] py-0 leading-none";

export const JADE_BTN_TYPO =
  "font-manrope font-bold text-gh-label uppercase tracking-[0.15em]";

export const JADE_BTN_LAYOUT =
  "inline-flex items-center justify-center gap-2 rounded-none max-w-full box-border";

export const JADE_BTN_PRIMARY =
  "bg-jade-gold text-black ring-1 ring-inset ring-jade-gold-muted hover:bg-[#dfbd52] transition-all duration-300";

export const JADE_BTN_SECONDARY =
  "bg-transparent border border-white/10 text-white/40 cursor-not-allowed hover:bg-transparent";

export const JADE_BTN_DISABLED =
  "opacity-50 pointer-events-none cursor-not-allowed";

/** Full-width form / modal CTAs. */
export const JADE_BTN_WIDTH_FORM = "w-full";

/** Below-hero section CTAs — full width mobile, centered lane on desktop. */
export const JADE_BTN_WIDTH_SECTION =
  "w-full md:w-auto max-w-full px-8 md:min-w-[22rem] lg:min-w-[24rem] md:px-10 lg:px-12";

/** Card actions, inline actions — narrow horizontal padding. */
export const JADE_BTN_WIDTH_COMPACT =
  "w-auto shrink-0 px-3 md:px-5 whitespace-nowrap";

/** Section CTA wrapper — centers button in desktop lane. */
export const JADE_BTN_SECTION_CONTAINER =
  "w-full flex justify-center md:max-w-xl md:mx-auto";

/** Composed class strings for legacy consumers. */
export const JADE_BTN_SECTION_CLASS = `${JADE_BTN_WIDTH_SECTION} ${JADE_BTN_HEIGHT}`;

/** md+ dimensions for non-PrimaryButton CTAs (e.g. glass travel guidelines). */
export const JADE_BTN_SECTION_DIMENSIONS_MD =
  "md:px-10 lg:px-12 md:min-w-[22rem] lg:min-w-[24rem]";

export type JadeButtonWidth = "form" | "section" | "compact" | "auto";
export type JadeButtonVariant = "primary" | "secondary";

export function jadeButtonWidthClass(width: JadeButtonWidth): string {
  switch (width) {
    case "form":
      return JADE_BTN_WIDTH_FORM;
    case "section":
      return JADE_BTN_WIDTH_SECTION;
    case "compact":
      return JADE_BTN_WIDTH_COMPACT;
    default:
      return "";
  }
}

export function jadeButtonVariantClass(
  variant: JadeButtonVariant,
  disabled?: boolean,
): string {
  if (disabled || variant === "secondary") {
    return variant === "secondary" && !disabled
      ? JADE_BTN_SECONDARY
      : `${JADE_BTN_SECONDARY} ${JADE_BTN_DISABLED}`;
  }
  return JADE_BTN_PRIMARY;
}
