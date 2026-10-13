/**
 * Mobile scroll-linked stage sizing.
 *
 * Computes a STABLE per-device frame (stage height, card heights, gaps) so panels
 * fit between the fixed navbar overlay and the bottom nav without clipping CTAs.
 *
 * Stability contract: values derive from window.innerWidth-keyed layout only and are
 * recomputed on orientation / width change — never on scroll or navbar show/hide.
 * This keeps the frame "unshakable" while the header slides in (overlay-only).
 */

const MOBILE_MQ = "(max-width: 1023px)";

/** Section label row — synced to {@link scrollLinkedSectionHeaderClass} padding. */
const SECTION_HEADER_MIN_PX = 68;
const SECTION_HEADER_VH_FACTOR = 0.088;
const SECTION_HEADER_MAX_PX = 100;

/** Min top/bottom breathing room inside the panel row (each side). */
const PANEL_BREATHING_MIN_PX = 28;
const PANEL_BREATHING_VH_FACTOR = 0.055;
const PANEL_BREATHING_MAX_PX = 56;

/** Standard horizontal sections — tighter gutters (title↔card, card↔bottom nav). */
const PANEL_BREATHING_STANDARD_MIN_PX = 10;
const PANEL_BREATHING_STANDARD_VH_FACTOR = 0.022;
const PANEL_BREATHING_STANDARD_MAX_PX = 20;

const CUSTOM_PROPS = [
  "--jade-vv-offset-top",
  "--jade-vv-height",
  "--jade-vv-nav-inset",
  "--jade-scroll-stage-mobile-height",
  "--jade-scroll-section-header-block",
  "--jade-scroll-panel-row-height",
  "--jade-scroll-panel-breathing-min",
  "--jade-scroll-panel-breathing-min-standard",
  "--jade-scroll-panel-edge-pad-standard",
  "--jade-scroll-text-reserve",
  "--jade-scroll-card-max-h",
  "--jade-scroll-card-max-h-featured",
  "--jade-scroll-card-max-h-tall-header",
  "--jade-scroll-panel-gap",
  "--jade-scroll-panel-gap-lg",
  "--jade-scroll-panel-bottom-gap",
  "--jade-mobile-chrome-top-px",
  "--jade-mobile-chrome-bottom-px",
] as const;

function parsePx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function readRootPx(varName: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return parsePx(raw) || fallback;
}

export function isScrollLinkedMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MQ).matches;
}

function clampGap(
  panelRowPx: number,
  minPx: number,
  vhFactor: number,
  maxPx: number,
): number {
  const fromVh = panelRowPx * vhFactor;
  return Math.round(Math.min(maxPx, Math.max(minPx, fromVh)));
}

/**
 * Pin the scroll-linked sticky stage to a stable height.
 * Uses innerHeight (stable per width) — not visualViewport — so browser chrome and
 * the overlay navbar showing/hiding does not resize the frame mid-scroll.
 */
export function syncScrollLinkedMobileViewport(): void {
  if (!isScrollLinkedMobileViewport()) return;

  const root = document.documentElement;
  const layoutH = window.innerHeight;

  const measuredBottom = readRootPx("--jade-mobile-chrome-bottom-px", 0);
  const chromeBottom =
    measuredBottom > 0
      ? measuredBottom
      : readRootPx("--jade-mobile-chrome-bottom", 80);

  /** Fixed navbar overlays content; only the bottom nav reduces usable stage height. */
  const stageHeight = Math.max(200, layoutH - chromeBottom);

  root.style.setProperty("--jade-vv-offset-top", "0px");
  root.style.setProperty("--jade-vv-height", `${layoutH}px`);
  root.style.setProperty("--jade-vv-nav-inset", "0px");
  root.style.setProperty(
    "--jade-scroll-stage-mobile-height",
    `${stageHeight}px`,
  );

  const headerBlock = clampGap(
    stageHeight,
    SECTION_HEADER_MIN_PX,
    SECTION_HEADER_VH_FACTOR,
    SECTION_HEADER_MAX_PX,
  );
  root.style.setProperty(
    "--jade-scroll-section-header-block",
    `${headerBlock}px`,
  );

  const panelRow = Math.max(160, stageHeight - headerBlock);
  root.style.setProperty("--jade-scroll-panel-row-height", `${panelRow}px`);

  const breathingMin = clampGap(
    panelRow,
    PANEL_BREATHING_MIN_PX,
    PANEL_BREATHING_VH_FACTOR,
    PANEL_BREATHING_MAX_PX,
  );
  root.style.setProperty(
    "--jade-scroll-panel-breathing-min",
    `${breathingMin}px`,
  );

  const breathingStandard = clampGap(
    panelRow,
    PANEL_BREATHING_STANDARD_MIN_PX,
    PANEL_BREATHING_STANDARD_VH_FACTOR,
    PANEL_BREATHING_STANDARD_MAX_PX,
  );
  root.style.setProperty(
    "--jade-scroll-panel-breathing-min-standard",
    `${breathingStandard}px`,
  );

  const panelGap = clampGap(panelRow, 6, 0.024, 12);
  const panelGapLg = clampGap(panelRow, 8, 0.032, 20);
  root.style.setProperty("--jade-scroll-panel-gap", `${panelGap}px`);
  root.style.setProperty("--jade-scroll-panel-gap-lg", `${panelGapLg}px`);
  root.style.setProperty(
    "--jade-scroll-panel-bottom-gap",
    "clamp(0.75rem, 2vw, 1rem)",
  );

  setCardMaxHeights(root, panelRow, panelGap, panelGapLg, breathingMin);
}

function setCardMaxHeights(
  root: HTMLElement,
  panelRowPx: number,
  panelGap: number,
  panelGapLg: number,
  breathingMin: number,
): void {
  const stackGaps = panelGap * 3 + panelGapLg;

  /** Standard Ways Jade — fixed stack height; symmetric edge pad (no 1fr grid drift). */
  const standardStackBudget = Math.max(260, panelRowPx);
  const textReserve = Math.min(
    188,
    Math.max(148, Math.round(standardStackBudget * 0.32) + stackGaps),
  );
  const tallHeaderReserve = textReserve + 28;

  root.style.setProperty("--jade-scroll-text-reserve", `${textReserve}px`);

  const cardMax = Math.min(
    620,
    Math.round(standardStackBudget * 0.76),
    Math.max(120, standardStackBudget - textReserve),
  );
  const cardMaxTall = Math.min(
    560,
    Math.round(standardStackBudget * 0.67),
    Math.max(120, standardStackBudget - tallHeaderReserve),
  );

  root.style.setProperty("--jade-scroll-card-max-h", `${cardMax}px`);
  root.style.setProperty(
    "--jade-scroll-card-max-h-tall-header",
    `${cardMaxTall}px`,
  );

  const standardStackHeight = cardMax + textReserve;
  const edgePadStandard = Math.max(
    10,
    Math.round((panelRowPx - standardStackHeight) / 2),
  );
  root.style.setProperty(
    "--jade-scroll-panel-edge-pad-standard",
    `${edgePadStandard}px`,
  );

  /**
   * Featured §6 — keep 1fr grid breathing (unchanged layout contract).
   */
  const featuredStackBudget = Math.max(260, panelRowPx - breathingMin * 2);
  const featuredTextReserve = Math.min(
    198,
    Math.max(158, Math.round(featuredStackBudget * 0.35) + stackGaps),
  );
  const featuredCardMaxBase = Math.min(
    600,
    Math.round(featuredStackBudget * 0.61),
    Math.max(150, featuredStackBudget - featuredTextReserve),
  );
  /** Featured §6 — +10% image height vs base card budget */
  const featuredCardMax = Math.min(
    660,
    Math.round(featuredCardMaxBase * 1.1),
    Math.max(150, featuredStackBudget - Math.round(featuredTextReserve * 0.9)),
  );
  root.style.setProperty(
    "--jade-scroll-card-max-h-featured",
    `${featuredCardMax}px`,
  );
}

/** Measure fixed bottom-nav chrome height once (orientation / width change). */
export function measureScrollLinkedChromeHeights(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const bottomEl = document.querySelector(".jade-scroll-chrome");

  if (bottomEl instanceof HTMLElement) {
    root.style.setProperty(
      "--jade-mobile-chrome-bottom-px",
      `${Math.ceil(bottomEl.getBoundingClientRect().height)}px`,
    );
  }
}

export function clearScrollLinkedMobileViewport(): void {
  const root = document.documentElement;
  for (const prop of CUSTOM_PROPS) {
    root.style.removeProperty(prop);
  }
}
