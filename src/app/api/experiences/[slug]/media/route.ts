import { NextResponse } from "next/server";
import { MEDIA_MANIFEST } from "@/generated/mediaManifest";

type FolderMedia = {
  folder: string; // relative folder inside /Experiences
  images: string[]; // public URLs
};

type ExperienceMediaResponse = {
  root: string; // e.g. "/Experiences/Weddings"
  all: string[];
  groups: FolderMedia[];
};

const SLUG_TO_FOLDER: Record<string, string> = {
  weddings: "Weddings",
  "corporate-retreats": "Corporate Retreats",
  caravans: "Caravan",
  "weekend-getaways": "Weekend Getaways",
  "party-villas": "Party Villas",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const folder = SLUG_TO_FOLDER[slug];
  if (!folder) {
    return NextResponse.json({ error: "Unknown experience slug" }, { status: 404 });
  }
  const entry = (MEDIA_MANIFEST as any).experiencesByFolder?.[folder];
  if (!entry) {
    return NextResponse.json(
      { error: `Missing experiences manifest for ${folder}` },
      { status: 404 },
    );
  }

  const res: ExperienceMediaResponse = {
    root: entry.root,
    all: entry.all,
    groups: entry.groups,
  };

  return NextResponse.json(res);
}

