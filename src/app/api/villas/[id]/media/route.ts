import { NextResponse } from "next/server";
import { VILLAS } from "@/lib/mockData";
import { resolvePublicVilla } from "@/lib/villas/resolvePublicVilla";
import { resolveVillaMedia } from "@/lib/villas/villaMediaResolution";
import type { Villa } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const merged = await resolvePublicVilla(id);
  const villa = (merged ?? VILLAS.find((v: Villa) => v.id === id)) as
    | Villa
    | undefined;
  if (!villa) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resolved = resolveVillaMedia(
    {
      id: villa.id,
      name: villa.name,
      image: villa.image,
      images: villa.images,
      spaces: villa.spaces,
      activities: villa.activities,
      categorizedSpaces: villa.categorizedSpaces,
      perfectForCards: villa.perfectForCards,
      portfolioSource: villa.portfolioSource,
    },
    id,
  );

  return NextResponse.json({
    hero: resolved.hero,
    spaces: resolved.spaces,
    experiences: resolved.experiences,
    perfectFor: resolved.perfectFor,
    other: [],
    categorizedSpaces: resolved.categorizedSpaces,
  });
}
