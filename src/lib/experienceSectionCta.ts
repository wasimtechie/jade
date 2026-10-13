/**
 * Experience landing section CTA layout — re-exports from jadeButtonTokens.
 * @deprecated Prefer PrimaryButton width="section" or JADE_BTN_* tokens directly.
 */

import {
  JADE_BTN_SECTION_CLASS,
  JADE_BTN_SECTION_CONTAINER,
  JADE_BTN_SECTION_DIMENSIONS_MD,
} from "@/lib/jadeButtonTokens";

/** Full width mobile, centered lane on desktop. Desktop+: fixed height, generous side padding. */
export const EXPERIENCE_SECTION_CTA_BUTTON_CLASS = JADE_BTN_SECTION_CLASS;

/** Center the CTA in a consistent lane (not full-bleed on desktop). */
export const EXPERIENCE_SECTION_CTA_CONTAINER_CLASS = JADE_BTN_SECTION_CONTAINER;

/** md+ dimensions for non-PrimaryButton CTAs (e.g. glass travel guidelines). */
export const EXPERIENCE_SECTION_CTA_DIMENSIONS_MD = JADE_BTN_SECTION_DIMENSIONS_MD;
