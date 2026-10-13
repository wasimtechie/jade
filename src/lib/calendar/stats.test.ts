import { describe, expect, it } from "vitest";
import { addDays } from "@/lib/bookingDates";
import {
  computeCalendarStats,
  computeDayOccupancy,
  lastOccupiedNight,
} from "@/lib/calendar/stats";
import type { CalendarVilla } from "@/lib/calendar/types";
import type { BookingRecord } from "@/lib/bookings/store";

const villas: CalendarVilla[] = [
  { id: "v1", slug: "a", name: "Villa A", bookable: true },
  { id: "v2", slug: "b", name: "Villa B", bookable: true },
  { id: "v3", slug: "c", name: "Villa C", bookable: false },
];

function booking(
  partial: Partial<BookingRecord> & Pick<BookingRecord, "id" | "villaId" | "checkIn" | "checkOut">,
): BookingRecord {
  return {
    bookingToken: "tok",
    bookingType: "stay",
    guests: 2,
    guestDetails: { name: "Test", email: "", phone: "" },
    pricing: {
      basePaise: 0,
      extraPaxPaise: 0,
      eventPaise: 0,
      addOnPaise: 0,
      taxPaise: 0,
      totalPaise: 0,
      snapshot: {} as BookingRecord["pricing"]["snapshot"],
    },
    payment: {
      gateway: "razorpay",
      paymentPlan: "full",
      amountDuePaise: 0,
      depositPaise: 0,
      depositPaidPaise: 0,
      balancePaise: 0,
      status: "paid",
    },
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

describe("calendar stats", () => {
  const days = ["2026-06-20", "2026-06-21", "2026-06-22"];

  it("counts arrivals and departures in window", () => {
    const bookings = [
      booking({
        id: "1",
        villaId: "v1",
        checkIn: "2026-06-20",
        checkOut: "2026-06-22",
      }),
    ];
    const stats = computeCalendarStats(villas, bookings, [], days);
    expect(stats.arrivals).toBe(1);
    expect(stats.departures).toBe(1);
    expect(stats.bookableVillas).toBe(2);
  });

  it("computes day occupancy percent", () => {
    const bookings = [
      booking({
        id: "1",
        villaId: "v1",
        checkIn: "2026-06-20",
        checkOut: "2026-06-22",
      }),
    ];
    const occ = computeDayOccupancy(villas, bookings, [], days);
    expect(occ[0]!.occupancyPct).toBe(50);
    expect(occ[1]!.bookedVillas).toBe(1);
  });

  it("resolves last occupied night before checkout", () => {
    expect(lastOccupiedNight("2026-06-20", "2026-06-22")).toBe("2026-06-21");
    expect(lastOccupiedNight("2026-06-20", "2026-06-21")).toBe("2026-06-20");
  });
});
