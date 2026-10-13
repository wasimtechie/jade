import type { Villa } from "@/lib/types";

type VillaDocLike = {
  status?: string;
  bookable?: boolean;
  content?: Record<string, unknown>;
};

function contentOf(doc: VillaDocLike) {
  return (doc.content ?? {}) as {
    hideFromVillasDirectory?: boolean;
    directoryListingOptOut?: boolean;
  };
}

/** Villa is removed from /retreats/ directory (status hidden or explicit flag). */
export function isHiddenFromVillasDirectory(
  doc: VillaDocLike,
  staticFallback?: Pick<Villa, "hideFromVillasDirectory">,
): boolean {
  if (doc.status === "hidden") return true;
  const content = contentOf(doc);
  if (content.hideFromVillasDirectory === true) return true;
  if (content.hideFromVillasDirectory === false) return false;
  return staticFallback?.hideFromVillasDirectory ?? false;
}

/** Public detail route should 404 — admin-only / fully hidden. */
export function isVillaPubliclyHidden(doc: VillaDocLike): boolean {
  return doc.status === "hidden";
}

/** Directory card + detail CTA — online booking allowed. */
export function isVillaRecordBookable(villa: {
  id: string;
  bookable?: boolean;
}): boolean {
  return villa.bookable !== false;
}

/** Read `content.hideFromVillasDirectory` for admin dashboards. */
export function villaHideFromDirectoryFlag(villa: VillaDocLike): boolean {
  return isHiddenFromVillasDirectory(villa);
}

/** Keep Mongo flags aligned when status changes in dashboard saves. */
export function syncVillaVisibilityFlags(villa: VillaDocLike): void {
  if (villa.status === "hidden") {
    villa.bookable = false;
    return;
  }
  if (villa.status === "active" || villa.status === "maintenance") {
    if (!villa.content) villa.content = {};
    const content = contentOf(villa);
    // Clear sticky flag left when a draft was hidden then published via Quick Edit.
    content.hideFromVillasDirectory = false;
    villa.content = content as Record<string, unknown>;
  }
}

export function directoryHiddenForMergedVilla(
  doc: VillaDocLike,
  staticVilla?: Villa,
): boolean {
  return isHiddenFromVillasDirectory(doc, staticVilla);
}

/**
 * Sticky hide flag from old hidden drafts (no explicit opt-out). Repairs Mongo in place.
 * Intentional “hide from /retreats/ only” sets `directoryListingOptOut` in Full Editor.
 */
export function repairStaleDirectoryHideFlag(doc: VillaDocLike): boolean {
  if (doc.status !== "active" && doc.status !== "maintenance") return false;
  const content = contentOf(doc);
  if (content.hideFromVillasDirectory !== true) return false;
  if (content.directoryListingOptOut === true) return false;
  content.hideFromVillasDirectory = false;
  if (!doc.content) doc.content = {};
  doc.content = content as Record<string, unknown>;
  return true;
}
