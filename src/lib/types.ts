/**
 * SHARED TYPE SYSTEM — Single source of truth for all interfaces.
 * Shared booking/enquiry types for /book, BookingContext, and overlays.
 */

import type { BookingCalendarDate } from "@/lib/bookingUiDates";

// ─── Date & Booking Core ──────────────────────────────────
export interface DateRange {
  checkIn: BookingCalendarDate | null;
  checkOut: BookingCalendarDate | null;
}

export interface Guests {
  adults: number;
  children: number;
  pets: number;
}

export interface UserDetails {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
}

// ─── Booking Payload (sent to API) ───────────────────────
export interface BookingPayload {
  villaId: string;
  villaName: string;
  dateRange: DateRange;
  guests: Guests;
  details: UserDetails;
  addOns: string[];
  totalAmount: number;
}

// ─── Villa ────────────────────────────────────────────────
export interface VillaStats {
  stay: string;
  events: string;
  bhk: string;
  lawn?: string;
  homeTheater?: string;
  villaArea?: string;
}

export interface VillaPricingPackage {
  label: string;
  sublabel?: string;
  price: string;
}

export interface VillaPricingTier {
  title: string;
  subtitle: string;
  packages: VillaPricingPackage[];
  features: string[];
}

export interface VillaAmenity {
  label: string;
  icon: string;
  description?: string;
}

/** Intro-band horizontal amenity tiles on villa detail page */
export interface VillaAmenityHighlight {
  label: string;
  sublabel?: string;
  icon: string;
}

export interface VillaPerfectForCard {
  title: string;
  image: string;
}

export interface VillaService {
  title: string;
  description: string;
  footer: string;
  icon: string;
}

export interface VillaSpace {
  name: string;
  image: string;
}

export interface VillaActivity {
  title: string;
  image: string;
  description?: string;
}

export interface VillaSpaceGroup {
  id: string;
  title: string;
  category: string;
  amenities: string[];
  images: string[];
}

export interface VillaFAQ {
  question: string;
  answer: string;
}

export interface Villa {
  id: string;
  slug?: string;
  retreatId?: string;
  /** When true, excluded from `/retreats/` listing only (deep links unchanged). */
  hideFromVillasDirectory?: boolean;
  /** When false, hide book flow and show enquire-only (default: bookable). */
  bookable?: boolean;
  addOnAvailability?: string[];
  name: string;
  /** One-line trust signal shown under villa name on detail page */
  socialProof?: string;
  type: string;
  location: string;
  description: string;
  image: string;
  images?: string[];
  stats: VillaStats;
  /** Intro chips on villa detail + listing cards */
  perfectForTags: string[];
  /** Image gallery section on villa detail */
  perfectForCards: VillaPerfectForCard[];
  /** Intro horizontal scroll tiles (distinct from full amenities grid) */
  amenityHighlights: VillaAmenityHighlight[];
  categories: string[];
  spaces?: VillaSpace[];
  amenities: VillaAmenity[];
  services?: VillaService[];
  propertyDetails?: Array<{
    label?: string;
    title?: string;
    description: string;
    icon?: string;
  }>;
  pricing?: {
    stay: VillaPricingTier;
    event: VillaPricingTier;
  };
  locationDetails?: {
    mapImage: string;
    address: string;
    distance: string;
    nearby: Array<{ label: string; distance: string; note?: string }>;
    /** Full Google Maps URL when you need an exact listing pin */
    googleMapsUrl?: string;
    /** Prefer over address search when set */
    coordinates?: { lat: number; lng: number };
  };
  activities?: VillaActivity[];
  categorizedSpaces?: VillaSpaceGroup[];
  video?: {
    youtubeUrl: string;
    thumbnail: string;
    duration: string;
  };
  faq?: VillaFAQ[];
  /** Public download — villa brochure PDF/DOC/PPT */
  brochureUrl?: string;
  brochureFilename?: string;
  /** Mongo portfolio source — `custom` = dashboard-authored, no manifest bleed */
  portfolioSource?: string;
}

// ─── Blog ─────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  content?: string;
  date?: string;
  category?: string;
  tags?: string[];
}

// ─── Wishlist ─────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  startingPrice: string | null;
}

// ─── API Response ─────────────────────────────────────────
export interface BookingResponse {
  success: boolean;
  referenceId: string;
  message?: string;
}

export interface EnquiryResponse {
  success: boolean;
  message?: string;
}
