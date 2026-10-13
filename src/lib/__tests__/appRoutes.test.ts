import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VILLAS, CATEGORIES } from "@/lib/mockData";
import {
  categoryToListingPath,
  experiencePanelHref,
  experiencesListingPath,
  isActiveAppPath,
  isForbiddenPath,
  VILLA_CATEGORY_ROUTE,
  villaListingPath,
  villaListingResultsPath,
  villaDetailPath,
  villaSpacesPath,
} from "@/lib/appRoutes";

const VILLA_IDS = new Set(VILLAS.map((v) => v.id));
const SRC_ROOT = join(process.cwd(), "src");

const STATIC_VILLA_PATH =
  /["'`]\/retreat\/([a-z0-9][a-z0-9-]*)(?:\/[^"'`]+)?["'`]/gi;

const ALLOWED_STATIC_SUFFIXES = new Set(["spaces"]);

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkTsx(full));
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function isDynamicVillaPathContext(source: string, matchIndex: number): boolean {
  const windowStart = Math.max(0, matchIndex - 40);
  const snippet = source.slice(windowStart, matchIndex + 20);
  return /\$\{/.test(snippet) || /\[id\]/.test(snippet);
}

describe("appRoutes", () => {
  it("uses canonical retreat routes and preserves listing filter/booking focus", () => {
    expect(villaListingPath()).toBe("/retreats/");
    const listing = new URL(villaListingResultsPath({ category: "Wellness Retreats" }), "https://jadehospitainment.com");
    expect(listing.pathname).toBe("/retreats/");
    expect(listing.searchParams.get("category")).toBe("Wellness Retreats");
    expect(listing.searchParams.get("focus")).toBe("listing");
    for (const villa of VILLAS) {
      expect(villaDetailPath(villa.id)).toBe(`/retreat/${villa.id}/`);
      expect(villaSpacesPath(villa.id)).toBe(`/retreat/${villa.id}/spaces/`);
      expect(isActiveAppPath(villaDetailPath(villa.id))).toBe(true);
      expect(isActiveAppPath(villaSpacesPath(villa.id))).toBe(true);
    }
  });
  it("categoryToListingPath returns active paths for all menu categories", () => {
    for (const cat of CATEGORIES) {
      const path = categoryToListingPath(cat);
      const pathname = path.split("?")[0] ?? path;
      expect(isActiveAppPath(pathname), `inactive path for ${cat}: ${path}`).toBe(
        true,
      );
      expect(isForbiddenPath(pathname)).toBe(false);
    }
  });

  it("VILLA_CATEGORY_ROUTE values are active and not forbidden", () => {
    for (const [label, path] of Object.entries(VILLA_CATEGORY_ROUTE)) {
      const pathname = path.split("?")[0] ?? path;
      expect(isActiveAppPath(pathname), `${label} → ${path}`).toBe(true);
      expect(isForbiddenPath(pathname), `${label} → ${path}`).toBe(false);
    }
  });

  it("experience scroll panel hrefs (home §3, /experiences) are active routes", () => {
    const panelTargets = [
      "Weekend Getaways",
      "Party Venues",
      "Weddings",
      "Corporate Retreats",
      "Wellness Retreats",
      "caravans",
      "villas",
    ] as const;

    for (const target of panelTargets) {
      const path = experiencePanelHref(target);
      const pathname = path.split("?")[0] ?? path;
      expect(isActiveAppPath(pathname), `${target} → ${path}`).toBe(true);
      expect(isForbiddenPath(pathname), `${target} → ${path}`).toBe(false);
    }

    expect(isActiveAppPath(experiencesListingPath())).toBe(true);
    expect(isActiveAppPath(villaListingPath())).toBe(true);
  });

  it("forbids legacy route path strings in src (except route registry)", () => {
    const legacyPathPattern =
      /\/(?:villa-retreats|party-villa-retreats)(?:\/|["'`\s?]|$)/;
    const files = walkTsx(SRC_ROOT).filter(
      (f) => !f.replace(/\\/g, "/").endsWith("lib/appRoutes.ts"),
    );

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (legacyPathPattern.test(text)) {
        expect.fail(`Legacy route path found in ${file}`);
      }
    }
  });

  it("static /retreat/{slug}/ strings in tsx match real villa ids", () => {
    const violations: string[] = [];

    for (const file of walkTsx(SRC_ROOT)) {
      const source = readFileSync(file, "utf8");
      let match: RegExpExecArray | null;
      STATIC_VILLA_PATH.lastIndex = 0;

      while ((match = STATIC_VILLA_PATH.exec(source)) !== null) {
        if (isDynamicVillaPathContext(source, match.index)) continue;

        const slug = match[1];
        if (!slug || ALLOWED_STATIC_SUFFIXES.has(slug)) continue;

        const full = match[0];
        if (full.includes("${")) continue;

        if (!VILLA_IDS.has(slug)) {
          violations.push(`${file}: ${full} (unknown villa id "${slug}")`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
