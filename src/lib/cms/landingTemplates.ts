export type LandingSlotKind = "hero" | "native" | "rich-text" | "divider";

export type LandingSlotDefinition = {
  slotId: string;
  label: string;
  kind: LandingSlotKind;
  defaultHeading?: string;
  defaultBody?: string;
  defaultImage?: string;
  /** Native sections cannot be removed from the palette (can be hidden). */
  required?: boolean;
};

export type LandingTemplate = {
  pageKey: string;
  path: string;
  label: string;
  slots: LandingSlotDefinition[];
};

const WEDDINGS_DEFAULT_HEADING = "Boutique Weddings\nSet in Nature";
const WEDDINGS_DEFAULT_BODY =
  "Private farmhouse and garden estates around Bangalore, designed for intimate ceremonies or large, multi-day celebrations.";

export const LANDING_TEMPLATES: Record<string, LandingTemplate> = {
  "landing/weddings": {
    pageKey: "landing/weddings",
    path: "/weddings",
    label: "Weddings",
    slots: [
      {
        slotId: "hero",
        label: "Hero banner",
        kind: "hero",
        required: true,
        defaultHeading: WEDDINGS_DEFAULT_HEADING,
        defaultBody: WEDDINGS_DEFAULT_BODY,
      },
      {
        slotId: "philosophy",
        label: "Philosophy scroll",
        kind: "native",
        required: true,
      },
      {
        slotId: "villas",
        label: "Wedding villas carousel",
        kind: "native",
        required: true,
      },
      { slotId: "meander-1", label: "Divider strip", kind: "divider" },
      {
        slotId: "services",
        label: "Services",
        kind: "native",
        required: true,
      },
      {
        slotId: "why-jade",
        label: "Why Jade weddings",
        kind: "native",
        required: true,
      },
      { slotId: "meander-2", label: "Divider strip", kind: "divider" },
      {
        slotId: "celebrations",
        label: "Celebrations",
        kind: "native",
        required: true,
      },
    ],
  },
  "landing/corporate-retreats": {
    pageKey: "landing/corporate-retreats",
    path: "/corporate-retreats",
    label: "Corporate retreats",
    slots: [
      {
        slotId: "hero",
        label: "Hero banner",
        kind: "hero",
        required: true,
        defaultHeading: "Corporate Offsites\nat Jade",
        defaultBody:
          "Private venues designed for focused sessions, team alignment, and meaningful downtime.",
        defaultImage: "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
      },
      { slotId: "trusted-by", label: "Trusted by", kind: "native", required: true },
      { slotId: "philosophy", label: "Philosophy scroll", kind: "native", required: true },
      { slotId: "formats", label: "Formats carousel", kind: "native", required: true },
      { slotId: "features", label: "Premium features", kind: "native", required: true },
      { slotId: "villas", label: "Villa carousel", kind: "native", required: true },
    ],
  },
  "landing/weekend-getaways": {
    pageKey: "landing/weekend-getaways",
    path: "/weekend-getaways",
    label: "Weekend getaways",
    slots: [
      {
        slotId: "hero",
        label: "Hero banner",
        kind: "hero",
        required: true,
        defaultHeading: "Weekend Getaways\nIn Bangalore",
        defaultBody:
          "Private Villas designed for relaxed escapes, small celebrations, and memorable weekends with friends and family.",
        defaultImage: "/Experiences/Weekend Getaways/1-Hero/casual stays.webp",
      },
      { slotId: "philosophy", label: "Philosophy scroll", kind: "native", required: true },
      { slotId: "carousel", label: "Weekend carousel", kind: "native", required: true },
      { slotId: "experiences", label: "Curated experiences", kind: "native", required: true },
      { slotId: "features", label: "Why choose Jade", kind: "native", required: true },
      { slotId: "villas", label: "Themed villas", kind: "native", required: true },
    ],
  },
  "landing/party-villas": {
    pageKey: "landing/party-villas",
    path: "/party-villas",
    label: "Party villas",
    slots: [
      {
        slotId: "hero",
        label: "Hero banner",
        kind: "hero",
        required: true,
        defaultHeading: "Celebrate in Style with\nJade Party Villas",
        defaultBody:
          "Host birthdays, pool parties, reunions or milestone celebrations in exclusive Jade villas with private pools, curated setups & personalized experiences.",
        defaultImage: "/Experiences/Party Villas/1-Hero/Pool Parties.webp",
      },
      { slotId: "philosophy", label: "Philosophy scroll", kind: "native", required: true },
      { slotId: "carousel", label: "Party types carousel", kind: "native", required: true },
      { slotId: "experiences", label: "Curated experiences", kind: "native", required: true },
      { slotId: "features", label: "Spaces for celebrations", kind: "native", required: true },
      { slotId: "villas", label: "Party villas carousel", kind: "native", required: true },
    ],
  },
  "landing/experiences": {
    pageKey: "landing/experiences",
    path: "/experiences",
    label: "Experiences hub",
    slots: [
      {
        slotId: "hero",
        label: "Hero banner",
        kind: "hero",
        required: true,
        defaultHeading: "Moments\nThoughtfully Hosted",
        defaultBody:
          "A collection of curated experiences designed across Jade's private VILLAS and distinctive settings.",
      },
      { slotId: "list", label: "Experiences scroll", kind: "native", required: true },
    ],
  },
};

export function getLandingTemplate(pageKey: string): LandingTemplate | null {
  return LANDING_TEMPLATES[pageKey] ?? null;
}

export function landingPageKeyForPath(path: string): string | undefined {
  const normalized = path.replace(/\/+$/, "") || "/";
  const entry = Object.values(LANDING_TEMPLATES).find(
    (t) => t.path === normalized,
  );
  return entry?.pageKey;
}

export function landingTemplateKeys(): string[] {
  return Object.keys(LANDING_TEMPLATES);
}

export function slotDefinition(
  pageKey: string,
  slotId: string,
): LandingSlotDefinition | undefined {
  const base = slotId.replace(/-copy-\d+$/, "").replace(/-custom-\d+$/, "");
  return getLandingTemplate(pageKey)?.slots.find((s) => s.slotId === base);
}

export function slotLabel(pageKey: string, section: { slotId?: string; sectionKey?: string }): string {
  const slotId = section.slotId ?? section.sectionKey ?? "section";
  const def = slotDefinition(pageKey, slotId);
  if (def) return def.label;
  if (slotId.startsWith("custom-rich")) return "Custom content block";
  if (slotId.includes("-copy-")) {
    const baseDef = slotDefinition(
      pageKey,
      slotId.replace(/-copy-\d+$/, ""),
    );
    return `${baseDef?.label ?? slotId} (copy)`;
  }
  return slotId;
}
