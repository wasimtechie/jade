import { VILLAS as STATIC_RETREATS } from "@/data/retreats";
import { MEDIA_MANIFEST } from "@/generated/mediaManifest";
import { getHeroOverrideForId } from "@/lib/heroOverrides";
import type { Villa } from "@/lib/types";
import {
  DOME_COLOR_META,
  getDomeColorFromVillaId,
  isDomeVillaId,
} from "@/lib/domeVillaIds";

export type VillaMediaSource = {
  id: string;
  name?: string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  spaces?: { image?: string }[];
  activities?: { image?: string }[];
  categorizedSpaces?: {
    id: string;
    title?: string;
    category?: string;
    amenities?: string[];
    images?: string[];
  }[];
  perfectForCards?: { image?: string }[];
  portfolioSource?: string;
};

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

function validImg(s: string | undefined): s is string {
  return Boolean(s && s.length > 0);
}

/** Dashboard-created or mongo-only villa — never bleed manifest folders. */
export function isDashboardAuthoredVilla(villa: VillaMediaSource): boolean {
  if (villa.portfolioSource === "custom") return true;
  return !STATIC_RETREATS.some((v) => v.id === villa.id);
}

/** Mongo has an explicit hero gallery override. */
export function hasExplicitHeroGallery(villa: VillaMediaSource): boolean {
  return Boolean(villa.images && villa.images.length > 0);
}

function explicitHeroList(villa: VillaMediaSource): string[] {
  return uniq([villa.thumbnail ?? villa.image ?? "", ...(villa.images ?? [])]);
}

function extractRetreatFoldersFromPath(url: string): string[] {
  const m = url.match(/^\/Villa_Retreats\/([^/]+)\//);
  if (!m?.[1]) return [];
  try {
    return [decodeURIComponent(m[1])];
  } catch {
    return [m[1]];
  }
}

function collectCandidateFolders(villa: VillaMediaSource): string[] {
  const candidates: string[] = [];
  const addFrom = (s?: string) => {
    if (!s) return;
    candidates.push(...extractRetreatFoldersFromPath(s));
  };
  addFrom(villa.image);
  addFrom(villa.thumbnail);
  (villa.images ?? []).forEach(addFrom);
  (villa.spaces ?? []).forEach((x) => addFrom(x?.image));
  (villa.activities ?? []).forEach((x) => addFrom(x?.image));
  (villa.categorizedSpaces ?? []).forEach((g) =>
    (g.images ?? []).forEach(addFrom),
  );
  return uniq(candidates);
}

export function resolveRetreatFolders(villa: VillaMediaSource): string[] {
  if (isDashboardAuthoredVilla(villa)) return [];

  const byFolder = (MEDIA_MANIFEST as { villasByFolder?: Record<string, unknown> })
    .villasByFolder ?? {};

  if (villa.name && byFolder[villa.name]) return [villa.name];
  if (isDomeVillaId(villa.id) && byFolder.Dome) return ["Dome"];

  const candidates = collectCandidateFolders(villa).filter((f) => byFolder[f]);
  if (candidates.length) return [candidates[0]];
  return [];
}

export function loadManifestMediaForFolders(folders: string[]): {
  hero: string[];
  spaces: string[];
  experiences: string[];
  perfectFor: string[];
} {
  const media = {
    hero: [] as string[],
    spaces: [] as string[],
    experiences: [] as string[],
    perfectFor: [] as string[],
  };
  const byFolder =
    (MEDIA_MANIFEST as unknown as {
      villasByFolder?: Record<
        string,
        {
          hero?: readonly string[];
          spaces?: readonly string[];
          experiences?: readonly string[];
          perfectFor?: readonly string[];
        }
      >;
    }).villasByFolder ?? {};

  for (const folder of folders) {
    const entry = byFolder[folder];
    if (!entry) continue;
    media.hero.push(...(entry.hero ?? []));
    media.spaces.push(...(entry.spaces ?? []));
    media.experiences.push(...(entry.experiences ?? []));
    media.perfectFor.push(...(entry.perfectFor ?? []));
  }

  return {
    hero: uniq(media.hero),
    spaces: uniq(media.spaces),
    experiences: uniq(media.experiences),
    perfectFor: uniq(media.perfectFor),
  };
}

export type ResolvedVillaMedia = {
  hero: string[];
  spaces: string[];
  experiences: string[];
  perfectFor: string[];
  categorizedSpaces: NonNullable<Villa["categorizedSpaces"]>;
  dashboardAuthored: boolean;
};

export function resolveVillaMedia(
  villa: VillaMediaSource,
  retreatId?: string,
): ResolvedVillaMedia {
  const id = retreatId ?? villa.id;
  const dashboardAuthored = isDashboardAuthoredVilla(villa);
  const overrideHero = getHeroOverrideForId(id);

  if (dashboardAuthored || hasExplicitHeroGallery(villa)) {
    const hero = explicitHeroList(villa);
    const spacesFromMongo =
      villa.categorizedSpaces
        ?.filter((g) => g.images && g.images.length > 0)
        .map((g) => ({
          id: g.id,
          title: g.title ?? "",
          category: g.category ?? "",
          amenities: g.amenities ?? [],
          images: g.images ?? [],
        })) ?? [];

    const spaces = uniq(
      spacesFromMongo.length
        ? spacesFromMongo.flatMap((g) => g.images)
        : (villa.spaces ?? []).map((s) => s.image).filter(validImg),
    );

    const experiences = uniq(
      (villa.activities ?? []).map((a) => a.image).filter(validImg),
    );

    const perfectFor = uniq(
      (villa.perfectForCards ?? []).map((c) => c.image).filter(validImg),
    );

    return {
      hero,
      spaces,
      experiences,
      perfectFor,
      categorizedSpaces: spacesFromMongo,
      dashboardAuthored,
    };
  }

  const folders = resolveRetreatFolders(villa);
  const manifest = loadManifestMediaForFolders(folders);

  let hero = overrideHero ?? manifest.hero;
  if (!hero.length && villa.image) hero = [villa.image];
  if (!hero.length && villa.images?.length) {
    hero = villa.images.filter(validImg);
  }

  let spaces = manifest.spaces;
  let experiences = manifest.experiences;
  let perfectFor = manifest.perfectFor;

  if (isDomeVillaId(id)) {
    experiences = experiences.filter((u) =>
      u.startsWith("/Villa_Retreats/Dome/3-Experienceee/"),
    );
    perfectFor = perfectFor.filter((u) =>
      u.startsWith("/Villa_Retreats/Dome/Perfect For/"),
    );
    const domeColor = getDomeColorFromVillaId(id);
    const domeNeedle = domeColor ? DOME_COLOR_META[domeColor].pathNeedle : null;
    const isDomeSpace = (u: string) =>
      u.startsWith("/Villa_Retreats/Dome/Dome Villa_s - ") &&
      (!domeNeedle || u.includes(domeNeedle));
    spaces = uniq([...hero.filter(isDomeSpace), ...spaces.filter(isDomeSpace)]);
  }

  const mongoCategorized = villa.categorizedSpaces?.filter(
    (g) => g.images && g.images.length > 0,
  );

  let categorizedSpaces: NonNullable<Villa["categorizedSpaces"]> = [];
  if (mongoCategorized?.length) {
    categorizedSpaces = mongoCategorized.map((g) => ({
      id: g.id,
      title: g.title ?? "",
      category: g.category ?? "",
      amenities: g.amenities ?? [],
      images: g.images ?? [],
    }));
  } else if (folders.length === 1) {
    const entry = (
      MEDIA_MANIFEST as unknown as {
        villasByFolder?: Record<
          string,
          { categorizedSpaces?: NonNullable<Villa["categorizedSpaces"]> }
        >;
      }
    ).villasByFolder?.[folders[0]];
    if (entry?.categorizedSpaces?.length) {
      categorizedSpaces = [...entry.categorizedSpaces];
    }
  }

  if (!categorizedSpaces.length && spaces.length) {
    categorizedSpaces = [
      {
        id: "all-spaces",
        title: "All Spaces",
        category: "All Spaces",
        amenities: [],
        images: spaces,
      },
    ];
  }

  const resolvedSpaces =
    spaces.length > 0
      ? spaces
      : (villa.spaces ?? []).map((s) => s.image).filter(validImg);

  const resolvedExperiences =
    experiences.length > 0
      ? experiences
      : (villa.activities ?? []).map((a) => a.image).filter(validImg);

  return {
    hero,
    spaces: resolvedSpaces,
    experiences: resolvedExperiences,
    perfectFor,
    categorizedSpaces,
    dashboardAuthored,
  };
}
