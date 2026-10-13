import { z } from "zod";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";
import { syncVillaVisibilityFlags } from "@/lib/villas/villaVisibility";
import { normalizeVillaSlug } from "@/lib/villas/villaIds";
import { mergeStaticRetreatContent } from "@/lib/villas/mergeStaticRetreatContent";
import { deriveChannelState } from "@/lib/axisRooms/channelState";

export const villaStatusSchema = z.enum(["active", "maintenance", "hidden"]);

export const villaChannelModeSchema = z.enum([
  "website_only",
  "channel_managed",
]);

const villaIdSchema = z
  .string()
  .min(2)
  .max(80)
  .transform((s) => normalizeVillaSlug(s))
  .refine((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), {
    message: "Use lowercase letters, numbers, and hyphens only",
  });

const weddingTierUpdateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(120).optional(),
  mode: z.enum(["half_day", "full_day"]).optional(),
  maxGuests: z.number().int().min(1).max(5000).optional(),
  priceRupees: z.number().int().min(0).max(50_000_000).optional(),
  stayIncludedPax: z.number().int().min(0).max(500).optional(),
});

const displayStatsSchema = z
  .object({
    stay: z.string().max(120).optional(),
    events: z.string().max(120).optional(),
    bhk: z.string().max(80).optional(),
    lawn: z.string().max(120).optional(),
    villaArea: z.string().max(120).optional(),
    pool: z.string().max(120).optional(),
  })
  .partial();

const axisRoomsSchema = z
  .object({
    propertyId: z.string().max(120).optional(),
    roomTypeId: z.string().max(120).optional(),
    ratePlanId: z.string().max(120).optional(),
    ratePlanName: z.string().max(200).optional(),
  })
  .partial();

const villaContentUpdateSchema = z
  .object({
    description: z.string().max(8000).optional(),
    socialProof: z.string().max(200).optional(),
    categories: z.array(z.string().max(80)).optional(),
    perfectForTags: z.array(z.string().max(80)).optional(),
    perfectForCards: z
      .array(z.object({ title: z.string(), image: z.string() }))
      .optional(),
    amenities: z
      .array(
        z.object({
          label: z.string(),
          icon: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    activities: z
      .array(
        z.object({
          title: z.string(),
          image: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    categorizedSpaces: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          category: z.string(),
          amenities: z.array(z.string()),
          images: z.array(z.string()),
        }),
      )
      .optional(),
    images: z.array(z.string().max(500)).optional(),
    locationDetails: z
      .object({
        mapImage: z.string().max(500).optional(),
        address: z.string().optional(),
        distance: z.string().optional(),
        googleMapsUrl: z.string().optional(),
        nearby: z
          .array(
            z.object({
              label: z.string(),
              distance: z.string(),
              note: z.string().optional(),
            }),
          )
          .optional(),
      })
      .partial()
      .optional(),
    services: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          footer: z.string().optional(),
          icon: z.string().optional(),
        }),
      )
      .optional(),
    propertyDetails: z
      .array(
        z.object({
          title: z.string().optional(),
          label: z.string().optional(),
          description: z.string(),
          icon: z.string().optional(),
        }),
      )
      .optional(),
    video: z
      .object({
        youtubeUrl: z.string().max(500).optional(),
        thumbnail: z.string().max(500).optional(),
        duration: z.string().max(20).optional(),
      })
      .partial()
      .optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    hideFromVillasDirectory: z.boolean().optional(),
    directoryListingOptOut: z.boolean().optional(),
    brochureUrl: z.string().max(500).optional(),
    brochureFilename: z.string().max(200).optional(),
  })
  .partial();

export const createVillaSchema = z
  .object({
    slug: villaIdSchema,
    retreatId: villaIdSchema.optional(),
    name: z.string().min(2).max(120),
    shortName: z.string().min(1).max(80),
    type: z.string().max(160).default(""),
    location: z.string().max(200).default(""),
    thumbnail: z.string().max(500).default(""),
    basePriceRupees: z.number().int().min(0).default(0),
    dayOutBasePriceRupees: z.number().int().min(0).default(0),
    stayBasePax: z.number().int().min(1).default(4),
    dayOutBasePax: z.number().int().min(1).default(8),
    stayMaxPax: z.number().int().min(1).default(8),
    status: villaStatusSchema.default("hidden"),
    bookable: z.boolean().default(false),
    content: villaContentUpdateSchema.optional(),
  })
  .refine((v) => v.stayBasePax <= v.stayMaxPax, {
    message: "stayBasePax cannot exceed stayMaxPax",
    path: ["stayMaxPax"],
  });

export type CreateVillaInput = z.infer<typeof createVillaSchema>;

export const updateVillaSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    shortName: z.string().min(1).max(80).optional(),
    type: z.string().max(160).optional(),
    location: z.string().max(200).optional(),
    thumbnail: z.string().max(500).optional(),
    basePriceRupees: z.number().int().min(0).max(50_000_000).optional(),
    dayOutBasePriceRupees: z.number().int().min(0).max(50_000_000).optional(),
    stayBasePax: z.number().int().min(1).max(500).optional(),
    dayOutBasePax: z.number().int().min(1).max(500).optional(),
    stayMaxPax: z.number().int().min(1).max(500).optional(),
    extraPaxStayRupees: z.number().int().min(0).max(1_000_000).optional(),
    extraPaxDayOutRupees: z.number().int().min(0).max(1_000_000).optional(),
    taxPercent: z.number().min(0).max(28).optional(),
    cleaningFeeRupees: z.number().int().min(0).max(10_000_000).optional(),
    securityDepositRupees: z.number().int().min(0).max(50_000_000).optional(),
    depositPaiseRupees: z.number().int().min(0).max(50_000_000).optional(),
    checkInTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    cancellationPolicy: z.string().max(2000).optional(),
    depositPercent: z.number().min(0).max(100).optional(),
    status: villaStatusSchema.optional(),
    bookable: z.boolean().optional(),
    weddingVenue: z.boolean().optional(),
    weddingTiers: z.array(weddingTierUpdateSchema).optional(),
    addOnAvailability: z.array(z.string().max(80)).optional(),
    displayStats: displayStatsSchema.optional(),
    notes: z.string().max(4000).optional(),
    channelMode: villaChannelModeSchema.optional(),
    axisRooms: axisRoomsSchema.optional(),
    content: villaContentUpdateSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })
  .refine(
    (v) => {
      if (v.stayBasePax !== undefined && v.stayMaxPax !== undefined) {
        return v.stayBasePax <= v.stayMaxPax;
      }
      return true;
    },
    { message: "stayBasePax cannot exceed stayMaxPax", path: ["stayMaxPax"] },
  );

export type UpdateVillaInput = z.infer<typeof updateVillaSchema>;

export type AdminWeddingTier = {
  id: string;
  label: string;
  mode: string;
  maxGuests: number;
  priceRupees: number;
  stayIncludedPax: number;
};

export type AdminVillaDetail = {
  id: string;
  slug: string;
  retreatId: string | null;
  name: string;
  shortName: string;
  type: string;
  location: string;
  thumbnail: string;
  portfolioSource: string | null;
  basePriceRupees: number;
  dayOutBasePriceRupees: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  extraPaxStayRupees: number;
  extraPaxDayOutRupees: number;
  weddingVenue: boolean;
  weddingTiers: AdminWeddingTier[];
  addOnAvailability: string[];
  displayStats: Record<string, string>;
  taxPercent: number;
  cleaningFeeRupees: number;
  securityDepositRupees: number;
  depositPaiseRupees: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  depositPercent: number;
  status: string;
  bookable: boolean;
  notes: string;
  channelMode: "website_only" | "channel_managed";
  channelState: "website_only" | "awaiting_mapping" | "live";
  axisRooms: {
    propertyId: string;
    roomTypeId: string;
    ratePlanId: string;
    ratePlanName: string;
  };
  content: Record<string, unknown>;
  updatedAt: string | null;
};

type VillaDocLike = {
  _id: unknown;
  slug: string;
  retreatId?: string;
  name: string;
  shortName?: string;
  type?: string;
  location?: string;
  thumbnail?: string;
  portfolioSource?: string;
  basePricePaise: number;
  dayOutBasePricePaise: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  extraPaxStayPaise?: number;
  extraPaxDayOutPaise?: number;
  weddingVenue?: boolean;
  weddingTiers?: {
    id: string;
    label: string;
    mode: string;
    maxGuests: number;
    pricePaise: number;
    stayIncludedPax?: number;
  }[];
  addOnAvailability?: string[];
  displayStats?: Record<string, string>;
  settings?: {
    taxPercent?: number;
    cleaningFeePaise?: number;
    securityDepositPaise?: number;
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
  };
  depositPercent?: number;
  depositPaise?: number;
  status?: string;
  bookable?: boolean;
  notes?: string;
  channelMode?: string;
  staah?: {
    propertyId?: string;
    roomTypeId?: string;
    ratePlanId?: string;
  };
  axisRooms?: {
    propertyId?: string;
    roomTypeId?: string;
    ratePlanId?: string;
    ratePlanName?: string;
  };
  content?: Record<string, unknown>;
  updatedAt?: Date;
};

export function toAdminVilla(
  doc: VillaDocLike,
  options?: { mergeStaticContent?: boolean },
): AdminVillaDetail {
  const s = doc.settings ?? {};
  const axis = doc.axisRooms ?? (doc as { staah?: typeof doc.axisRooms }).staah ?? {};
  const rawContent = (doc.content as Record<string, unknown>) ?? {};
  const content =
    options?.mergeStaticContent === false
      ? rawContent
      : mergeStaticRetreatContent(doc.retreatId ?? doc.slug, rawContent);
  return {
    id: String(doc._id),
    slug: doc.slug,
    retreatId: doc.retreatId ?? null,
    name: doc.name,
    shortName: doc.shortName ?? doc.name,
    type: doc.type ?? "",
    location: doc.location ?? "",
    thumbnail: doc.thumbnail ?? "",
    portfolioSource: doc.portfolioSource ?? null,
    basePriceRupees: paiseToRupees(doc.basePricePaise),
    dayOutBasePriceRupees: paiseToRupees(doc.dayOutBasePricePaise),
    stayBasePax: doc.stayBasePax,
    dayOutBasePax: doc.dayOutBasePax,
    stayMaxPax: doc.stayMaxPax,
    extraPaxStayRupees: paiseToRupees(doc.extraPaxStayPaise ?? 200_000),
    extraPaxDayOutRupees: paiseToRupees(doc.extraPaxDayOutPaise ?? 100_000),
    weddingVenue: doc.weddingVenue ?? false,
    weddingTiers: (doc.weddingTiers ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      mode: t.mode,
      maxGuests: t.maxGuests,
      priceRupees: paiseToRupees(t.pricePaise),
      stayIncludedPax: t.stayIncludedPax ?? 0,
    })),
    addOnAvailability: doc.addOnAvailability ?? [],
    displayStats: doc.displayStats
      ? {
          stay: doc.displayStats.stay,
          events: doc.displayStats.events,
          bhk: doc.displayStats.bhk,
          lawn: doc.displayStats.lawn,
          villaArea: doc.displayStats.villaArea,
          pool: doc.displayStats.pool,
        }
      : {},
    taxPercent: s.taxPercent ?? 18,
    cleaningFeeRupees: paiseToRupees(s.cleaningFeePaise ?? 0),
    securityDepositRupees: paiseToRupees(s.securityDepositPaise ?? 0),
    depositPaiseRupees: paiseToRupees(doc.depositPaise ?? 0),
    checkInTime: s.checkInTime ?? "14:00",
    checkOutTime: s.checkOutTime ?? "11:00",
    cancellationPolicy: s.cancellationPolicy ?? "",
    depositPercent: doc.depositPercent ?? 0,
    status: doc.status ?? "active",
    bookable: doc.bookable ?? true,
    notes: doc.notes ?? "",
    channelMode: (doc.channelMode ?? "website_only") as
      | "website_only"
      | "channel_managed",
    channelState: deriveChannelState(doc),
    axisRooms: {
      propertyId: axis.propertyId ?? "",
      roomTypeId: axis.roomTypeId ?? "",
      ratePlanId: axis.ratePlanId ?? "",
      ratePlanName: axis.ratePlanName ?? "",
    },
    content,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export function applyVillaUpdate(
  villa: {
    name: string;
    shortName?: string;
    type?: string;
    location?: string;
    thumbnail?: string;
    basePricePaise: number;
    dayOutBasePricePaise: number;
    stayBasePax: number;
    dayOutBasePax: number;
    stayMaxPax: number;
    extraPaxStayPaise: number;
    extraPaxDayOutPaise: number;
    weddingVenue: boolean;
    weddingTiers: {
      id: string;
      label: string;
      mode: string;
      maxGuests: number;
      pricePaise: number;
      stayIncludedPax: number;
    }[];
    addOnAvailability: string[];
    displayStats?: Record<string, string>;
    settings: {
      taxPercent: number;
      cleaningFeePaise: number;
      securityDepositPaise: number;
      checkInTime: string;
      checkOutTime: string;
      cancellationPolicy: string;
    };
    depositPercent: number;
    depositPaise?: number;
    status: string;
    bookable: boolean;
    notes?: string;
    channelMode?: string;
    axisRooms?: {
      propertyId?: string;
      roomTypeId?: string;
      ratePlanId?: string;
    };
    content?: Record<string, unknown>;
  },
  input: UpdateVillaInput,
): Record<string, unknown> {
  const applied: Record<string, unknown> = {};

  if (input.name !== undefined) {
    villa.name = input.name;
    applied.name = input.name;
  }
  if (input.shortName !== undefined) {
    villa.shortName = input.shortName;
    applied.shortName = input.shortName;
  }
  if (input.type !== undefined) {
    villa.type = input.type;
    applied.type = input.type;
  }
  if (input.location !== undefined) {
    villa.location = input.location;
    applied.location = input.location;
  }
  if (input.thumbnail !== undefined) {
    villa.thumbnail = input.thumbnail;
    applied.thumbnail = input.thumbnail;
  }
  if (input.basePriceRupees !== undefined) {
    villa.basePricePaise = rupeesToPaise(input.basePriceRupees);
    applied.basePriceRupees = input.basePriceRupees;
  }
  if (input.dayOutBasePriceRupees !== undefined) {
    villa.dayOutBasePricePaise = rupeesToPaise(input.dayOutBasePriceRupees);
    applied.dayOutBasePriceRupees = input.dayOutBasePriceRupees;
  }
  if (input.stayBasePax !== undefined) {
    villa.stayBasePax = input.stayBasePax;
    applied.stayBasePax = input.stayBasePax;
  }
  if (input.dayOutBasePax !== undefined) {
    villa.dayOutBasePax = input.dayOutBasePax;
    applied.dayOutBasePax = input.dayOutBasePax;
  }
  if (input.stayMaxPax !== undefined) {
    villa.stayMaxPax = input.stayMaxPax;
    applied.stayMaxPax = input.stayMaxPax;
  }
  if (input.extraPaxStayRupees !== undefined) {
    villa.extraPaxStayPaise = rupeesToPaise(input.extraPaxStayRupees);
    applied.extraPaxStayRupees = input.extraPaxStayRupees;
  }
  if (input.extraPaxDayOutRupees !== undefined) {
    villa.extraPaxDayOutPaise = rupeesToPaise(input.extraPaxDayOutRupees);
    applied.extraPaxDayOutRupees = input.extraPaxDayOutRupees;
  }
  if (input.taxPercent !== undefined) {
    villa.settings.taxPercent = input.taxPercent;
    applied.taxPercent = input.taxPercent;
  }
  if (input.cleaningFeeRupees !== undefined) {
    villa.settings.cleaningFeePaise = rupeesToPaise(input.cleaningFeeRupees);
    applied.cleaningFeeRupees = input.cleaningFeeRupees;
  }
  if (input.securityDepositRupees !== undefined) {
    villa.settings.securityDepositPaise = rupeesToPaise(
      input.securityDepositRupees,
    );
    applied.securityDepositRupees = input.securityDepositRupees;
  }
  if (input.depositPaiseRupees !== undefined) {
    villa.depositPaise = rupeesToPaise(input.depositPaiseRupees);
    applied.depositPaiseRupees = input.depositPaiseRupees;
  }
  if (input.checkInTime !== undefined) {
    villa.settings.checkInTime = input.checkInTime;
    applied.checkInTime = input.checkInTime;
  }
  if (input.checkOutTime !== undefined) {
    villa.settings.checkOutTime = input.checkOutTime;
    applied.checkOutTime = input.checkOutTime;
  }
  if (input.cancellationPolicy !== undefined) {
    villa.settings.cancellationPolicy = input.cancellationPolicy;
    applied.cancellationPolicy = true;
  }
  if (input.depositPercent !== undefined) {
    villa.depositPercent = input.depositPercent;
    applied.depositPercent = input.depositPercent;
  }
  if (input.status !== undefined) {
    villa.status = input.status;
    applied.status = input.status;
  }
  if (input.bookable !== undefined) {
    villa.bookable = input.bookable;
    applied.bookable = input.bookable;
  }
  if (input.status !== undefined) {
    syncVillaVisibilityFlags(villa);
    if (villa.status === "hidden") {
      applied.bookable = false;
    } else {
      applied.hideFromVillasDirectory = false;
    }
  }
  if (input.weddingVenue !== undefined) {
    villa.weddingVenue = input.weddingVenue;
    applied.weddingVenue = input.weddingVenue;
  }
  if (input.weddingTiers !== undefined) {
    for (const patch of input.weddingTiers) {
      const tier = villa.weddingTiers.find((t) => t.id === patch.id);
      if (!tier) continue;
      if (patch.label !== undefined) tier.label = patch.label;
      if (patch.mode !== undefined) tier.mode = patch.mode;
      if (patch.maxGuests !== undefined) tier.maxGuests = patch.maxGuests;
      if (patch.priceRupees !== undefined) {
        tier.pricePaise = rupeesToPaise(patch.priceRupees);
      }
      if (patch.stayIncludedPax !== undefined) {
        tier.stayIncludedPax = patch.stayIncludedPax;
      }
    }
    applied.weddingTiers = input.weddingTiers.map((t) => t.id);
  }
  if (input.addOnAvailability !== undefined) {
    villa.addOnAvailability = input.addOnAvailability;
    applied.addOnAvailability = input.addOnAvailability;
  }
  if (input.displayStats !== undefined) {
    villa.displayStats = { ...(villa.displayStats ?? {}), ...input.displayStats };
    applied.displayStats = input.displayStats;
  }
  if (input.notes !== undefined) {
    villa.notes = input.notes;
    applied.notes = true;
  }
  if (input.channelMode !== undefined) {
    villa.channelMode = input.channelMode;
    applied.channelMode = input.channelMode;
  }
  if (input.axisRooms !== undefined) {
    villa.axisRooms = { ...(villa.axisRooms ?? {}), ...input.axisRooms };
    applied.axisRooms = input.axisRooms;
  }
  if (input.content !== undefined) {
    villa.content = {
      ...(villa.content ?? {}),
      ...input.content,
    } as Record<string, unknown>;
    applied.content = true;
  }

  if (
    input.stayBasePax !== undefined &&
    input.stayMaxPax === undefined &&
    villa.stayBasePax > villa.stayMaxPax
  ) {
    throw new Error("stayBasePax cannot exceed stayMaxPax");
  }
  if (
    input.stayMaxPax !== undefined &&
    input.stayBasePax === undefined &&
    villa.stayBasePax > villa.stayMaxPax
  ) {
    throw new Error("stayMaxPax cannot be less than stayBasePax");
  }

  return applied;
}
