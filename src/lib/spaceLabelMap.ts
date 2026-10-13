import type { Villa, VillaSpaceGroup } from "@/lib/types";
import { prettyMediaLabel } from "@/lib/mediaLabels";

function normPath(url: string): string {
  try {
    return decodeURIComponent(url).replace(/\\/g, "/");
  } catch {
    return url.replace(/\\/g, "/");
  }
}

/** Build image URL → human label from villa data and optional API categorized spaces. */
export function buildSpaceLabelMap(
  villa: Pick<Villa, "spaces" | "categorizedSpaces">,
  apiCategorized?: VillaSpaceGroup[] | null,
): Map<string, string> {
  const map = new Map<string, string>();

  const add = (image: string | undefined, label: string) => {
    if (!image || !label.trim()) return;
    map.set(normPath(image), label.trim());
  };

  for (const s of villa.spaces ?? []) {
    add(s.image, s.name);
  }

  for (const g of villa.categorizedSpaces ?? []) {
    const title = g.title || g.category;
    for (const img of g.images ?? []) {
      add(img, title);
    }
  }

  for (const g of apiCategorized ?? []) {
    const title = g.title || g.category;
    for (const img of g.images ?? []) {
      add(img, title);
    }
  }

  return map;
}

export function labelForSpaceImage(
  image: string,
  labelMap: Map<string, string>,
  fallback = "Space",
): string {
  const key = normPath(image);
  return (
    labelMap.get(key) ??
    prettyMediaLabel({ url: image, fallback, kind: "space" })
  );
}
