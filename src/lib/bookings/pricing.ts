import {
  COMPLIMENTARY_ADDON_IDS,
  getAddOn,
  type AddOnCatalogEntry,
} from "./addOnCatalog";
import {
  DEFAULT_CHILD_FREE_AGE_LIMIT,
  DEFAULT_DEPOSIT_PERCENT,
} from "./config";
import { addDays, expandDateRangeInclusive, nightCount } from "../bookingDates";
import type { AddOnLine, BookingPricing, BookingType, PricingSnapshot } from "./types";

export interface VillaPricingInput {
  slug: string;
  basePricePaise: number;
  dayOutBasePricePaise: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  extraPaxStayPaise: number;
  extraPaxDayOutPaise: number;
  weddingVenue?: boolean;
  weddingTiers?: Array<{
    id: string;
    label: string;
    mode: "half_day" | "full_day";
    maxGuests: number;
    pricePaise: number;
    stayIncludedPax: number;
  }>;
  settings: {
    taxPercent: number;
    cleaningFeePaise: number;
    securityDepositPaise: number;
  };
  depositPercent?: number;
  depositPaise?: number;
}

export interface ComputePricingInput {
  villa: VillaPricingInput;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults?: number;
  children?: number;
  childFreeAgeLimit?: number;
  eventTierId?: string;
  eventGuests?: number;
  eventStartDate?: string;
  eventEndDate?: string;
  addOns?: AddOnLine[];
  allowedAddOnIds?: string[];
}

export interface PricingError {
  code: string;
  message: string;
}

function chargeableHeads(input: ComputePricingInput): number {
  const limit = input.childFreeAgeLimit ?? DEFAULT_CHILD_FREE_AGE_LIMIT;
  const adults = input.adults ?? input.guests;
  const children = input.children ?? 0;
  const chargeableChildren = Math.max(0, children - (children > 0 ? 0 : 0));
  void chargeableChildren;
  // Default: children under limit not counted — use adults + older children approximated via guests-adults
  const youngerChildren = Math.min(children, children);
  const nonChargeable = Math.min(youngerChildren, limit);
  return Math.max(adults, input.guests - nonChargeable);
}

function computeAddOns(
  lines: AddOnLine[] | undefined,
  guestPax: number,
  villaSlug: string,
  allowedAddOnIds: string[] | undefined,
): {
  addOnPaise: number;
  quoteOnlyAddOns: string[];
  errors: PricingError[];
} {
  let addOnPaise = 0;
  const quoteOnlyAddOns: string[] = [];
  const errors: PricingError[] = [];
  const hasConfiguredAllowlist =
    Array.isArray(allowedAddOnIds) && allowedAddOnIds.length > 0;

  for (const line of lines ?? []) {
    if (COMPLIMENTARY_ADDON_IDS.has(line.id)) continue;
    const entry = getAddOn(line.id);
    if (!entry) {
      errors.push({ code: "INVALID_ADDON", message: `Unknown add-on: ${line.id}` });
      continue;
    }
    if (hasConfiguredAllowlist && !allowedAddOnIds.includes(line.id)) {
      errors.push({
        code: "ADDON_NOT_AVAILABLE",
        message: `${line.id} not available for this villa`,
      });
      continue;
    }
    if (!hasConfiguredAllowlist && entry.villaIds && !entry.villaIds.includes(villaSlug)) {
      errors.push({ code: "ADDON_NOT_AVAILABLE", message: `${line.id} not at this villa` });
      continue;
    }
    if (entry.mode === "quoteOnly") {
      quoteOnlyAddOns.push(line.id);
      continue;
    }
    if (entry.mode === "flat") {
      addOnPaise += entry.pricePaise * Math.max(1, line.quantity);
    } else if (entry.mode === "perPerson") {
      const pax = Math.max(line.quantity, guestPax);
      if (pax < entry.minPax) {
        errors.push({
          code: "MIN_PAX",
          message: `${entry.label} requires min ${entry.minPax} guests`,
        });
        continue;
      }
      addOnPaise += entry.pricePerPersonPaise * pax;
    }
  }

  return { addOnPaise, quoteOnlyAddOns, errors };
}

export function computeBookingPricing(
  input: ComputePricingInput,
): { pricing: BookingPricing; depositPaise: number; errors: PricingError[] } {
  const errors: PricingError[] = [];
  const v = input.villa;
  const heads = chargeableHeads(input);

  if (heads > v.stayMaxPax) {
    errors.push({ code: "CAPACITY", message: "Guest count exceeds villa maximum" });
  }

  let basePaise = 0;
  let extraPaxPaise = 0;
  let eventPaise = 0;
  let resolvedTier: PricingSnapshot["eventTier"];

  const basePax =
    input.bookingType === "day_out" ? v.dayOutBasePax : v.stayBasePax;
  const extraRate =
    input.bookingType === "day_out" ? v.extraPaxDayOutPaise : v.extraPaxStayPaise;

  if (input.bookingType === "stay") {
    const nights = nightCount(input.checkIn, input.checkOut);
    basePaise = v.basePricePaise * nights;
    extraPaxPaise = Math.max(0, heads - v.stayBasePax) * v.extraPaxStayPaise;
  } else if (input.bookingType === "day_out") {
    basePaise = v.dayOutBasePricePaise;
    extraPaxPaise = Math.max(0, heads - v.dayOutBasePax) * v.extraPaxDayOutPaise;
  }

  if (input.eventTierId) {
    const tier = v.weddingTiers?.find((t) => t.id === input.eventTierId);
    if (!tier) {
      errors.push({ code: "INVALID_TIER", message: "Unknown event tier" });
    } else {
      const eg = input.eventGuests ?? input.guests;
      if (eg > tier.maxGuests) {
        errors.push({
          code: "EVENT_CAPACITY",
          message: `Event guests exceed tier max (${tier.maxGuests})`,
        });
      }
      const start = input.eventStartDate ?? input.checkIn;
      const end = input.eventEndDate ?? start;
      const days = expandDateRangeInclusive(start, end).length;
      eventPaise = tier.pricePaise * Math.max(1, days);
      resolvedTier = {
        id: tier.id,
        label: tier.label,
        mode: tier.mode,
        pricePaise: tier.pricePaise,
        stayIncludedPax: tier.stayIncludedPax,
      };
    }
  } else if (input.bookingType === "event") {
    errors.push({ code: "MISSING_TIER", message: "Event booking requires eventTierId" });
  }

  void basePax;
  void extraRate;

  const { addOnPaise, quoteOnlyAddOns, errors: addOnErrors } = computeAddOns(
    input.addOns,
    heads,
    v.slug,
    input.allowedAddOnIds,
  );
  errors.push(...addOnErrors);

  const taxableBase = basePaise + extraPaxPaise + eventPaise + addOnPaise;
  const taxPaise = Math.round((taxableBase * v.settings.taxPercent) / 100);
  const totalPaise = taxableBase + taxPaise;

  const depositPercent = v.depositPercent ?? DEFAULT_DEPOSIT_PERCENT;
  const depositPaise =
    v.depositPaise ??
    (depositPercent > 0 ? Math.round((totalPaise * depositPercent) / 100) : totalPaise);

  const snapshot: PricingSnapshot = {
    basePricePaise: v.basePricePaise,
    dayOutBasePricePaise: v.dayOutBasePricePaise,
    stayBasePax: v.stayBasePax,
    dayOutBasePax: v.dayOutBasePax,
    extraPaxStayPaise: v.extraPaxStayPaise,
    extraPaxDayOutPaise: v.extraPaxDayOutPaise,
    chargeableHeadsRule: {
      childFreeAgeLimit: input.childFreeAgeLimit ?? DEFAULT_CHILD_FREE_AGE_LIMIT,
      countInfants: false,
    },
    eventTier: resolvedTier,
    cleaningFeePaise: v.settings.cleaningFeePaise,
    securityDepositPaise: v.settings.securityDepositPaise,
    taxPercent: v.settings.taxPercent,
  };

  return {
    pricing: {
      basePaise,
      extraPaxPaise,
      eventPaise,
      addOnPaise,
      taxPaise,
      totalPaise,
      quoteOnlyAddOns: quoteOnlyAddOns.length ? quoteOnlyAddOns : undefined,
      snapshot,
    },
    depositPaise,
    errors,
  };
}

export function lockDatesForBooking(input: {
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  eventStartDate?: string;
  eventEndDate?: string;
}): string[] {
  if (input.bookingType === "day_out") {
    return [input.checkIn];
  }
  if (input.eventStartDate && input.eventEndDate) {
    return expandDateRangeInclusive(input.eventStartDate, input.eventEndDate);
  }
  if (input.bookingType === "event") {
    const start = input.eventStartDate ?? input.checkIn;
    const end = input.eventEndDate ?? start;
    return expandDateRangeInclusive(start, end);
  }
  const dates: string[] = [];
  let cur = input.checkIn;
  while (cur < input.checkOut) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}
