import type { BookingRecord } from "@/lib/bookings/store";
import type { Role } from "@/lib/auth/permissions";

export type CalendarVilla = {
  id: string;
  slug: string;
  name: string;
  status?: string;
  bookable?: boolean;
  weddingVenue?: boolean;
  location?: string | null;
  stayMaxPax?: number;
};

export type CalendarBlock = {
  id: string;
  villaId: string;
  checkIn: string;
  checkOut: string;
  reason: string;
};

export type CalendarStats = {
  arrivals: number;
  departures: number;
  inHouse: number;
  occupiedTonight: number;
  bookableVillas: number;
  pendingCount: number;
  conflictCount: number;
  blockedNights: number;
};

export type DayOccupancy = {
  date: string;
  bookedVillas: number;
  blockedVillas: number;
  bookableTotal: number;
  occupancyPct: number;
};

export type CalendarMeta = {
  role: Role;
  canViewGuestDetails: boolean;
  canOpenFolio: boolean;
  canCreateBlocks: boolean;
};

export type CalendarResponse = {
  from: string;
  to: string;
  villas: CalendarVilla[];
  bookings: BookingRecord[];
  blocks: CalendarBlock[];
  stats: CalendarStats;
  occupancy: DayOccupancy[];
  meta: CalendarMeta;
};
