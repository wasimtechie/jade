import {
  getLandingTemplate,
  slotDefinition,
  type LandingSlotKind,
} from "@/lib/cms/landingTemplates";

export type CmsLandingSection = {
  sectionKey: string;
  slotId: string;
  landingKind: LandingSlotKind;
  enabled?: boolean;
  heading?: string;
  body?: string;
  image?: string;
  caption?: string;
};

export function defaultSectionsForTemplate(pageKey: string): CmsLandingSection[] {
  const template = getLandingTemplate(pageKey);
  if (!template) return [];
  return template.slots.map((slot) => ({
    sectionKey: slot.slotId,
    slotId: slot.slotId,
    landingKind: slot.kind,
    enabled: true,
    heading: slot.defaultHeading ?? "",
    body: slot.defaultBody ?? "",
    image: slot.defaultImage ?? "",
  }));
}

function isLegacyLandingSections(sections: CmsLandingSection[]): boolean {
  if (!sections.length) return true;
  return sections.every(
    (s) =>
      !s.slotId ||
      !s.landingKind ||
      (s.sectionKey === "hero" && !s.slotId && Boolean(s.heading || s.body)),
  );
}

/** Normalize stored CMS rows into the full ordered section list. */
export function resolveLandingSections(
  pageKey: string,
  stored: CmsLandingSection[] | undefined | null,
): CmsLandingSection[] {
  const defaults = defaultSectionsForTemplate(pageKey);
  if (!stored?.length || isLegacyLandingSections(stored)) {
    return defaults;
  }

  return stored.map((row) => {
    const slotId = row.slotId ?? row.sectionKey;
    const def = slotDefinition(pageKey, slotId);
    const landingKind =
      row.landingKind ?? def?.kind ?? ("rich-text" as LandingSlotKind);
    return {
      sectionKey: row.sectionKey || slotId,
      slotId,
      landingKind,
      enabled: row.enabled !== false,
      heading: row.heading ?? def?.defaultHeading ?? "",
      body: row.body ?? def?.defaultBody ?? "",
      image: row.image ?? def?.defaultImage ?? "",
      caption: row.caption,
    };
  });
}

export function duplicateLandingSection(
  section: CmsLandingSection,
  index: number,
): CmsLandingSection {
  const copyId = `${section.slotId}-copy-${Date.now()}`;
  return {
    ...JSON.parse(JSON.stringify(section)),
    sectionKey: copyId,
    slotId: section.landingKind === "rich-text" ? copyId : section.slotId,
    landingKind:
      section.landingKind === "hero"
        ? "rich-text"
        : section.landingKind === "native"
          ? "rich-text"
          : section.landingKind,
    enabled: true,
  };
}

export function newCustomRichSection(): CmsLandingSection {
  const key = `custom-rich-${Date.now()}`;
  return {
    sectionKey: key,
    slotId: key,
    landingKind: "rich-text",
    enabled: true,
    heading: "",
    body: "",
    image: "",
  };
}

export function heroHeadingLines(heading: string): string[] {
  return heading.split(/\n+/).map((l) => l.trim()).filter(Boolean);
}

export function landingSectionsToPayload(
  sections: CmsLandingSection[],
): Record<string, unknown>[] {
  return sections.map((s) => ({
    sectionKey: s.sectionKey,
    slotId: s.slotId,
    landingKind: s.landingKind,
    enabled: s.enabled !== false,
    heading: s.heading ?? "",
    body: s.body ?? "",
    image: s.image ?? "",
    caption: s.caption ?? "",
    type: "text",
  }));
}
