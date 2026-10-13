import type { Villa } from "@/lib/types";
import { trimMetaDescription } from "@/lib/seo/meta";

function firstStayPrice(villa: Villa): string | null {
  const raw = villa.pricing?.stay?.packages?.[0]?.price;
  if (!raw) return null;
  return String(raw).replace(/\s*\+\s*taxes\s*/i, "").trim();
}

function locationHook(villa: Villa): string {
  const loc = villa.location.replace(/\s*[·\.]\s*.+$/, "").trim();
  const firstSentence = villa.description.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 90) return firstSentence;
  return `${villa.type} near ${loc}`;
}

/** Meta description with price anchor when pricing exists. */
export function buildVillaMetaDescription(villa: Villa): string {
  const price = firstStayPrice(villa);
  const hook = locationHook(villa);

  if (price) {
    return trimMetaDescription(`${villa.name} from ${price} — ${hook}`);
  }

  return trimMetaDescription(villa.description);
}
