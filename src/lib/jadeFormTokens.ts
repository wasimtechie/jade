import { EXPERIENCE_OVERLAY_FLOATING_LABEL_CLASS } from "@/lib/experienceOverlayTheme";

export const JADE_FORM_WARN = "#D32C55";
export const JADE_FORM_FOCUS = "#EFCD62";

export type JadeFormTheme =
  | "overlayGreen"
  | "book"
  | "footerCharcoal"
  | "experienceCharcoal"
  | "dashboardCharcoal";

export type JadeFormVariant = "standard" | "footer";

export function getFieldShellClass(options: {
  invalid: boolean;
  showError: boolean;
  variant?: JadeFormVariant;
  theme?: JadeFormTheme;
}): string {
  const { invalid, showError, variant = "standard", theme } = options;
  const indicating = invalid && showError;
  const shape = variant === "footer" ? "rounded-none" : "rounded-sm";

  if (indicating) {
    return `group relative border-2 border-[#D32C55] transition-colors ${shape}`;
  }

  const defaultBorder =
    variant === "footer"
      ? "border border-white/15 focus-within:border-[#EFCD62]/55"
      : theme === "dashboardCharcoal"
        ? "border border-white/12 focus-within:border-[#EFCD62]/60 focus-within:shadow-[0_0_0_1px_rgba(239,205,98,0.15)]"
        : "border border-white/20 focus-within:border-[#EFCD62]";

  return `group relative ${defaultBorder} transition-colors ${shape}`;
}

export const JADE_FORM_INPUT_CLASS =
  "peer w-full bg-transparent px-4 py-3.5 text-white text-gh-body placeholder-transparent focus:outline-none font-manrope";

/**
 * Native `<input type="date">` — hides the browser calendar affordance.
 * Pair with a trailing Calendar button that calls `input.showPicker()`.
 */
export const JADE_FORM_DATE_INPUT_CLASS = `${JADE_FORM_INPUT_CLASS} pr-12 [color-scheme:dark] appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden`;

export const JADE_FORM_INPUT_FOOTER_CLASS =
  "peer w-full bg-white/[0.02] px-4 py-4 text-white text-gh-body placeholder-transparent focus:outline-none transition-all duration-300 rounded-none h-14 font-manrope";

/** Room for trailing chevron/icon (matches px-4 left padding). */
export const JADE_FORM_TRAILING_ICON_INSET = "pr-11";

export const JADE_FORM_SELECT_FOOTER_CLASS = `${JADE_FORM_INPUT_FOOTER_CLASS} ${JADE_FORM_TRAILING_ICON_INSET} appearance-none cursor-pointer`;

export const JADE_FORM_SELECT_CLASS = `${JADE_FORM_INPUT_CLASS} ${JADE_FORM_TRAILING_ICON_INSET} appearance-none cursor-pointer`;

const LABEL_OVERLAY_GREEN =
  "absolute left-4 top-1/2 -translate-y-1/2 text-gh-label text-white/60 transition-all duration-300 pointer-events-none px-1 peer-focus:-top-3 peer-focus:translate-y-0 peer-focus:text-white peer-focus:bg-[#123A2D] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-white peer-[:not(:placeholder-shown)]:bg-[#123A2D]";

const LABEL_BOOK =
  "absolute left-4 top-1/2 -translate-y-1/2 text-gh-label text-white/60 transition-all duration-300 pointer-events-none px-1 peer-focus:-top-3 peer-focus:translate-y-0 peer-focus:text-white peer-focus:bg-[#0B2C23] peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-white peer-[:not(:placeholder-shown)]:bg-[#0B2C23]";

const LABEL_FOOTER =
  "absolute left-4 top-1/2 -translate-y-1/2 text-gh-label text-white/45 transition-all duration-300 pointer-events-none px-2 peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-white/75 peer-focus:bg-[#2E3034] peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-white/75 peer-[:not(:placeholder-shown)]:bg-[#2E3034]";

const DASH_LABEL_BASE =
  "text-[0.6875rem] leading-tight tracking-wide max-w-[calc(100%-1.5rem)] truncate";

const LABEL_DASHBOARD =
  `absolute left-4 top-1/2 -translate-y-1/2 ${DASH_LABEL_BASE} text-white/45 transition-all duration-300 pointer-events-none px-2 peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-white/80 peer-focus:bg-[#222528] peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-white/80 peer-[:not(:placeholder-shown)]:bg-[#222528]`;

export const JADE_FORM_INPUT_DASHBOARD_CLASS =
  "peer w-full bg-white/[0.03] px-4 py-3.5 text-white text-gh-body placeholder-transparent focus:outline-none transition-all duration-300 rounded-sm h-[var(--dash-form-float-h,2.75rem)] font-manrope";

export const JADE_FORM_SELECT_DASHBOARD_CLASS = `${JADE_FORM_INPUT_DASHBOARD_CLASS} ${JADE_FORM_TRAILING_ICON_INSET} appearance-none cursor-pointer`;

const LABEL_EXPERIENCE =
  "absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gh-label text-white/60 transition-all duration-300 pointer-events-none px-2 font-manrope peer-focus:-top-3 peer-focus:translate-y-0 peer-focus:text-white peer-focus:bg-jade-charcoal peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-white peer-[:not(:placeholder-shown)]:bg-jade-charcoal";

export function getFloatingLabelClass(theme: JadeFormTheme): string {
  switch (theme) {
    case "book":
      return LABEL_BOOK;
    case "footerCharcoal":
      return LABEL_FOOTER;
    case "dashboardCharcoal":
      return LABEL_DASHBOARD;
    case "experienceCharcoal":
      return LABEL_EXPERIENCE;
    default:
      return LABEL_OVERLAY_GREEN;
  }
}

/**
 * Floating label for `<select>` — same idle/focus/value motion as inputs,
 * using `peer-valid` instead of `placeholder-shown` (select has no placeholder).
 */
export function getFloatingLabelSelectClass(theme: JadeFormTheme): string {
  return getFloatingLabelClass(theme).replace(
    /peer-\[:not\(:placeholder-shown\)\]:/g,
    "peer-valid:",
  );
}

/** Trailing affordance (chevron/calendar) aligned to field horizontal padding. */
export function getFieldTrailingIconClass(active = false): string {
  return `pointer-events-none absolute right-4 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 shrink-0 transition-colors ${
    active
      ? "text-[#EFCD62]"
      : "text-white/35 group-focus-within:text-[#EFCD62]"
  }`;
}

/** Date/custom triggers: float label when open or filled (no `peer-valid` on buttons). */
export function getFloatingLabelFloatedOverrides(theme: JadeFormTheme): string {
  const bg = getSelectOptionBg(theme);
  if (theme === "footerCharcoal" || theme === "dashboardCharcoal") {
    return `!-top-2.5 !translate-y-0 text-white/75 ${bg}`;
  }
  return `!-top-3 !translate-y-0 text-white ${bg}`;
}

/**
 * Centered label for selects, date triggers, etc. — no `peer-valid` / `peer-focus`
 * (those utilities mis-fire on `<select>` and break footer vs overlay parity).
 */
export function getFloatingLabelIdleClass(theme: JadeFormTheme): string {
  const muted =
    theme === "footerCharcoal" || theme === "dashboardCharcoal"
      ? "text-white/45"
      : "text-white/60";
  const px =
    theme === "footerCharcoal" || theme === "dashboardCharcoal"
      ? "px-2"
      : "px-1";
  const size =
    theme === "dashboardCharcoal"
      ? DASH_LABEL_BASE
      : "text-gh-label";
  return `absolute left-4 top-1/2 -translate-y-1/2 ${size} ${muted} transition-all duration-300 pointer-events-none font-manrope ${px}`;
}

/** Label chip on the top border (focus, open, or filled). */
export function getFloatingLabelFloatedClass(theme: JadeFormTheme): string {
  const bg = getSelectOptionBg(theme);
  const muted =
    theme === "footerCharcoal" || theme === "dashboardCharcoal"
      ? "text-white/75"
      : "text-white";
  const top =
    theme === "footerCharcoal" || theme === "dashboardCharcoal"
      ? "-top-2.5"
      : "-top-3";
  const px =
    theme === "footerCharcoal" || theme === "dashboardCharcoal"
      ? "px-2"
      : "px-1";
  return `absolute left-4 ${top} translate-y-0 ${DASH_LABEL_BASE} ${muted} ${bg} transition-all duration-300 pointer-events-none font-manrope z-10 ${px}`;
}

/** Vertical rhythm for overlay enquiry forms (room for -top-3 labels). */
export const JADE_OVERLAY_FORM_STACK_CLASS = "flex flex-col gap-5 flex-1";

export function getTextareaFloatingLabelClass(theme: JadeFormTheme): string {
  return getFloatingLabelIdleClass(theme).replace(
    "top-1/2 -translate-y-1/2",
    "top-6 translate-y-0",
  );
}

export function getStaticChipLabelClass(theme: JadeFormTheme): string {
  const chip =
    theme === "experienceCharcoal"
      ? EXPERIENCE_OVERLAY_FLOATING_LABEL_CLASS
      : theme === "footerCharcoal"
        ? "bg-[#2E3034]"
        : theme === "dashboardCharcoal"
          ? "bg-[#222528]"
          : theme === "book"
            ? "bg-[#0B2C23]"
            : "bg-[#123A2D]";
  return `absolute -top-3 left-4 ${chip} px-2 text-white/40 text-gh-label uppercase font-bold tracking-widest z-10 font-manrope`;
}

export function getSelectOptionBg(theme: JadeFormTheme): string {
  if (theme === "footerCharcoal") return "bg-[#2E3034]";
  if (theme === "dashboardCharcoal") return "bg-[#222528]";
  if (theme === "book") return "bg-[#0B2C23]";
  if (theme === "experienceCharcoal") return "bg-jade-charcoal";
  return "bg-[#123A2D]";
}

export function themeToVariant(theme: JadeFormTheme): JadeFormVariant {
  return theme === "footerCharcoal" ? "footer" : "standard";
}

export function getDashboardInputClass(theme: JadeFormTheme): string {
  return theme === "dashboardCharcoal"
    ? JADE_FORM_INPUT_DASHBOARD_CLASS
    : themeToVariant(theme) === "footer"
      ? JADE_FORM_INPUT_FOOTER_CLASS
      : JADE_FORM_INPUT_CLASS;
}

export function getDashboardSelectClass(theme: JadeFormTheme): string {
  return theme === "dashboardCharcoal"
    ? JADE_FORM_SELECT_DASHBOARD_CLASS
    : themeToVariant(theme) === "footer"
      ? JADE_FORM_SELECT_FOOTER_CLASS
      : JADE_FORM_SELECT_CLASS;
}
