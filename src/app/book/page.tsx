"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Minus,
  Plus,
  ChevronLeft,
  MapPin,
  Users,
  Bed,
  Home,
  Check,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { VILLAS } from "@/lib/mockData";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import { isBookingDetailsValid } from "@/lib/bookingDetailsValidation";
import type { UserDetails, Villa } from "@/lib/types";
import { useBooking, DateRange, Guests } from "@/context/BookingContext";
import BookingDetailsFormFields from "@/components/booking/BookingDetailsFormFields";
import { initiatePayment } from "@/lib/paymentService";
import { formatPaise } from "@/lib/money";
import type { BookingPricing } from "@/lib/bookings/types";
import { villaListingPath, villaListingResultsPath } from "@/lib/appRoutes";
import { useSafeBack } from "@/lib/safeBackNavigation";
import { openRazorpayCheckout } from "@/lib/payments/razorpayCheckout";
import { confirmTestPayment } from "@/lib/payments/confirmTestPayment";
import {
  compareBookingCalendarDates,
  formatBookingCalendarDate,
  isBookingCalendarDateInRange,
  toBookingCalendarDate,
  type BookingCalendarDate,
} from "@/lib/bookingUiDates";
import {
  getClientPaymentGatewayMode,
  paymentModeLabel,
} from "@/lib/payments/paymentGatewayMode";
import { isVillaBookable, isVillaRecordBookable } from "@/lib/villaBooking";
import {
  estimateAddOnPaise,
  formatBookAddOnPrice,
  getBookPageAddOns,
} from "@/lib/bookings/bookPageAddOns";
import { slugForPublicVillaId } from "@/lib/villas/identity";

/* ─────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────── */
type Step = "dates" | "guests" | "details" | "review";

/* ─────────────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const NIGHT_TAX = 99000;

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */
function generateMonths(count = 3) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    // Convert JS Sunday=0 to Mon-first grid (0=Mon … 6=Sun)
    const startDay = (d.getDay() + 6) % 7;
    return {
      name: `${MONTH_NAMES[month]} ${year}`,
      year,
      month,
      days,
      startDay,
    };
  });
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(d: BookingCalendarDate | null): string {
  return formatBookingCalendarDate(d);
}

function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// Accept today's components as args so callers control when Date() is evaluated
function isPastDate(
  year: number,
  month: number,
  day: number,
  todayYear: number,
  todayMonth: number,
  todayDay: number,
) {
  if (year !== todayYear) return year < todayYear;
  if (month !== todayMonth) return month < todayMonth;
  return day < todayDay;
}

/* ─────────────────────────────────────────────────────────────────────
   Step progress dots
───────────────────────────────────────────────────────────────────── */
function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["dates", "guests", "details", "review"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex w-full gap-1">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`flex-1 h-[2px] transition-all duration-400 ${i <= idx ? "bg-[#EFCD62]" : "bg-white/20"}`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Step 1: Select Dates (with live booked dates)
───────────────────────────────────────────────────────────────────── */
function StepDates({
  dateRange,
  setDateRange,
  villaId,
  bookingDisabled = false,
}: {
  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;
  villaId: string | null;
  bookingDisabled?: boolean;
}) {
  // `mounted` defers all Date-based logic to the client only, preventing
  // server/client HTML mismatches (hydration errors).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute months only on the client (after mount) to avoid hydration mismatch
  const MONTHS = mounted ? generateMonths(3) : [];
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());

  // Fetch availability for each displayed month when villaId is known
  useEffect(() => {
    if (!villaId || !mounted) return;

    MONTHS.forEach(async ({ year, month }) => {
      const key = `${year}-${month}`;
      setLoadingMonths((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(
          `/api/bookings/availability?publicVillaId=${villaId}&year=${year}&month=${month}`,
        );
        if (!res.ok) return;
        const data: { bookedDates: string[]; blockedDates?: string[] } =
          await res.json();
        setBookedDates((prev) => {
          const next = new Set(prev);
          data.bookedDates.forEach((d) => next.add(d));
          return next;
        });
        setBlockedDates((prev) => {
          const next = new Set(prev);
          (data.blockedDates ?? []).forEach((d) => next.add(d));
          return next;
        });
      } finally {
        setLoadingMonths((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaId, mounted]);

  // Compute today's components once per render (always on client after mount)
  const todayRef = (() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  })();

  const handleDayClick = (year: number, month: number, day: number) => {
    if (bookingDisabled) return;
    const iso = toISO(year, month, day);
    if (
      bookedDates.has(iso) ||
      blockedDates.has(iso) ||
      isPastDate(year, month, day, todayRef.y, todayRef.m, todayRef.d)
    )
      return;

    const clicked = toBookingCalendarDate(year, month, day);
    const { checkIn, checkOut } = dateRange;

    if (!checkIn || (checkIn && checkOut)) {
      setDateRange({ checkIn: clicked, checkOut: null });
    } else {
      if (compareBookingCalendarDates(clicked, checkIn) <= 0) {
        setDateRange({ checkIn: clicked, checkOut: null });
        return;
      }
      let cursor = checkIn.iso;
      let blockedInSpan = false;
      while (cursor < clicked.iso) {
        if (
          cursor !== checkIn.iso &&
          (bookedDates.has(cursor) || blockedDates.has(cursor))
        ) {
          blockedInSpan = true;
          break;
        }
        const next = new Date(`${cursor}T00:00:00.000Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        cursor = next.toISOString().slice(0, 10);
      }
      if (blockedInSpan) {
        setDateRange({ checkIn: clicked, checkOut: null });
        return;
      }
      setDateRange({ checkIn, checkOut: clicked });
    }
  };

  const isInRange = (year: number, month: number, day: number) => {
    const { checkIn, checkOut } = dateRange;
    if (!checkIn || !checkOut) return false;
    return isBookingCalendarDateInRange(
      toBookingCalendarDate(year, month, day),
      checkIn,
      checkOut,
    );
  };

  const isSelected = (year: number, month: number, day: number) => {
    const { checkIn, checkOut } = dateRange;
    if (
      checkIn?.year === year &&
      checkIn.month === month &&
      checkIn.day === day
    )
      return "start";
    if (
      checkOut?.year === year &&
      checkOut.month === month &&
      checkOut.day === day
    )
      return "end";
    return false;
  };

  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const isLoading = loadingMonths.size > 0;

  // Show a stable skeleton until client hydration is complete
  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 border-b border-white/10 py-3 px-5">
          <div className="grid grid-cols-7 text-center">
            {DAY_LABELS.map((d) => (
              <span
                key={d}
                className="text-white/50 text-gh-label font-manrope tracking-widest uppercase"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#EFCD62] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {bookingDisabled && (
        <div className="shrink-0 mx-5 mt-4 mb-1 flex items-start gap-2 rounded-sm border border-white/15 bg-white/5 px-4 py-3 text-[#A6C0B5] text-gh-label font-manrope leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#EFCD62] mt-0.5" />
          <span>
            Online booking is not available for this villa. Please use{" "}
            <a
              href="tel:08970663366"
              className="text-[#EFCD62] font-bold hover:text-white transition-colors"
            >
              Enquire
            </a>{" "}
            to plan your stay.
          </span>
        </div>
      )}
      {/* Day headers */}
      <div className="shrink-0 border-b border-white/10 py-3 px-5">
        <div className="grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <span
              key={d}
              className="text-white/50 text-gh-label font-manrope tracking-widest uppercase"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-5 py-2 text-[#EFCD62] text-gh-label font-manrope">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading live availability…</span>
        </div>
      )}

      {/* Calendars */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-20 pt-4"
        data-lenis-prevent
      >
        {MONTHS.map(({ name, year, month, days, startDay }) => (
          <div key={name} className="mb-6">
            <h3 className="text-white font-manrope font-bold text-gh-scroll mb-3">
              {name}
            </h3>
            <div className="grid grid-cols-7 gap-[9.6px] text-center">
              {Array.from({ length: startDay }, (_, i) => (
                <div key={`empty-${i}`} className="w-[35px] h-[35px]" />
              ))}
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                const iso = toISO(year, month, day);
                const booked = bookedDates.has(iso);
                const blocked = blockedDates.has(iso);
                const past = isPastDate(
                  year,
                  month,
                  day,
                  todayRef.y,
                  todayRef.m,
                  todayRef.d,
                );
                const unavail = bookingDisabled || booked || blocked || past;
                const sel = isSelected(year, month, day);
                const inRange = isInRange(year, month, day);

                return (
                  <button
                    key={day}
                    disabled={unavail}
                    onClick={() => handleDayClick(year, month, day)}
                    title={
                      bookingDisabled
                        ? "Online booking unavailable"
                        : booked
                          ? "Already booked"
                          : blocked
                            ? "Unavailable (blocked)"
                            : past
                              ? "Past date"
                              : undefined
                    }
                    className={`w-[35px] h-[35px] mx-auto flex items-center justify-center text-gh-body font-manrope transition-colors rounded-[3px] relative overflow-hidden ${sel ? "bg-[#EFCD62] text-[#0B2C23] font-bold" : ""} ${inRange ? "bg-[#EFCD62]/20 text-white" : ""} ${!sel && !inRange && !unavail ? "bg-[#165040] text-white hover:bg-[#1e6050]" : ""} ${unavail ? "bg-[#165040]/50 text-white/25 cursor-not-allowed" : ""}`}
                  >
                    {unavail && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="block w-[140%] h-[1px] bg-white/20 -rotate-45" />
                      </span>
                    )}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Step 2: Total Guests
───────────────────────────────────────────────────────────────────── */
function StepGuests({
  guests,
  setGuests,
}: {
  guests: Guests;
  setGuests: (g: Guests) => void;
}) {
  const update = (key: keyof Guests, val: number) =>
    setGuests({ ...guests, [key]: Math.max(0, val) });

  const Counter = ({
    label,
    subtitle,
    value,
    onMinus,
    onPlus,
  }: {
    label: string;
    subtitle?: string;
    value: number;
    onMinus: () => void;
    onPlus: () => void;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/10">
      <div>
        <p className="text-white font-philosopher text-gh-body">{label}</p>
        {subtitle && (
          <p className="text-white/40 text-gh-label font-manrope mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onMinus}
          className="w-9 h-9 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-white font-philosopher text-gh-h2 w-12 text-center leading-none">
          {String(value).padStart(2, "0")}
        </span>
        <button
          onClick={onPlus}
          className="w-9 h-9 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors bg-white/5 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto px-5 md:px-8 pb-24"
        data-lenis-prevent
      >
        <Counter
          label="Adults"
          subtitle="Age 13 years and more"
          value={guests.adults}
          onMinus={() => update("adults", guests.adults - 1)}
          onPlus={() => update("adults", guests.adults + 1)}
        />
        <Counter
          label="Children"
          subtitle="Age 3 – 12 years"
          value={guests.children}
          onMinus={() => update("children", guests.children - 1)}
          onPlus={() => update("children", guests.children + 1)}
        />
        <Counter
          label="Pets"
          value={guests.pets}
          onMinus={() => update("pets", guests.pets - 1)}
          onPlus={() => update("pets", guests.pets + 1)}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Step 3: Your Details
───────────────────────────────────────────────────────────────────── */
function StepDetails({
  details,
  setDetails,
  forceShowErrors,
}: {
  details: UserDetails;
  setDetails: (d: UserDetails) => void;
  forceShowErrors: boolean;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex-1 min-h-0 enquiry-overlay-scroll px-5 md:px-8 py-4 pb-24"
        data-lenis-prevent
      >
        <BookingDetailsFormFields
          details={details}
          setDetails={setDetails}
          forceShowErrors={forceShowErrors}
          idPrefix="book"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Step 4: Review & Pay
───────────────────────────────────────────────────────────────────── */
type ServerPreview = {
  pricing: BookingPricing;
  payment: {
    amountDuePaise: number;
    depositPaise: number;
    balancePaise: number;
    paymentPlan: string;
  };
};

function StepReview({
  dateRange,
  guests,
  details,
  selectedVilla,
  bookingVillaSlug,
  goToStep,
  selectedAddOns,
  setSelectedAddOns,
  serverPreview,
  previewLoading,
}: {
  dateRange: DateRange;
  guests: Guests;
  details: UserDetails;
  selectedVilla: Villa | null;
  bookingVillaSlug: string | null;
  goToStep: (s: Step) => void;
  selectedAddOns: string[];
  setSelectedAddOns: React.Dispatch<React.SetStateAction<string[]>>;
  serverPreview: ServerPreview | null;
  previewLoading: boolean;
}) {
  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const bookAddOns = getBookPageAddOns(
    bookingVillaSlug ?? selectedVilla?.id,
    selectedVilla?.addOnAvailability,
  );
  const addOnTotal = serverPreview?.pricing.addOnPaise ?? 0;
  const displayTotal = serverPreview?.pricing.totalPaise ?? 0;
  const displayTax = serverPreview?.pricing.taxPaise ?? 0;
  const displayBase =
    (serverPreview?.pricing.basePaise ?? 0) +
    (serverPreview?.pricing.extraPaxPaise ?? 0) +
    (serverPreview?.pricing.eventPaise ?? 0);

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-32"
        data-lenis-prevent
      >
        {/* VILLA CARD */}
        {selectedVilla && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-32 h-48 sm:h-32 shrink-0 border border-white/20">
              <Image
                src={selectedVilla.image}
                alt={selectedVilla.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.15em] uppercase mb-1 mt-2 sm:mt-0">
                {selectedVilla.type}
              </p>
              <h3 className="text-white font-philosopher text-gh-h2 mb-2.5 leading-none">
                {selectedVilla.name}
              </h3>
              <div className="flex flex-col gap-1.5 text-white/80 text-gh-desc font-manrope">
                <a
                  href={getVillaGoogleMapsUrl(selectedVilla)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-fit rounded-sm outline-none hover:text-[#EFCD62] transition-colors focus-visible:ring-2 focus-visible:ring-[#EFCD62]/55"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#EFCD62] shrink-0" />{" "}
                  <span className="hover:underline underline-offset-2">
                    {selectedVilla.location}
                  </span>
                </a>
                {selectedVilla.stats.stay && (
                  <span className="flex items-center gap-2">
                    <Bed className="w-3.5 h-3.5 text-[#EFCD62]" />{" "}
                    {selectedVilla.stats.stay} Stay
                  </span>
                )}
                {selectedVilla.stats.bhk && (
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#EFCD62]" />{" "}
                    {selectedVilla.stats.bhk}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY BLOCKS */}
        <div className="space-y-3">
          <SummaryBlock
            label="Dates"
            value={`${formatDate(dateRange.checkIn)} – ${formatDate(dateRange.checkOut)}`}
            onEdit={() => goToStep("dates")}
          />
          <SummaryBlock
            label="Total Guests"
            value={`${guests.adults + guests.children} Guests${guests.children > 0 ? `, ${guests.children} Children` : ""}${guests.pets > 0 ? `, ${guests.pets} Pet${guests.pets > 1 ? "s" : ""}` : ""}`}
            onEdit={() => goToStep("guests")}
          />
          <div className="bg-white/5 p-4 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-white font-manrope font-bold text-gh-body mb-1">
                Your Details
              </p>
              <ul className="text-white/80 text-gh-desc font-manrope space-y-0.5 list-disc list-inside">
                <li>Name: {details.fullName}</li>
                <li>Number: {details.phone}</li>
                <li>Email: {details.email}</li>
                {details.notes && (
                  <li>
                    Note: {details.notes.slice(0, 40)}
                    {details.notes.length > 40 ? "…" : ""}
                  </li>
                )}
              </ul>
            </div>
            <button
              onClick={() => goToStep("details")}
              className="bg-[#1E4336] border border-white/20 px-4 py-2 text-gh-label font-bold tracking-widest text-white uppercase hover:bg-[#285848] transition-colors font-manrope shrink-0 ml-4"
            >
              EDIT
            </button>
          </div>
        </div>

        {/* ADD-ONS */}
        <div className="mt-6">
          <h4 className="text-white font-manrope font-bold text-gh-body mb-1">
            Add On Experiences
          </h4>
          <p className="text-white/70 text-gh-desc font-manrope mb-3">
            Optional experiences available at an additional cost.
            <br />
            Pricing is subject to confirmation based on group size.
          </p>
          <div className="space-y-2.5">
            {bookAddOns.map((addon) => (
              <label
                key={addon.id}
                className="flex items-center justify-between py-1 cursor-pointer group"
                onClick={() => toggleAddOn(addon.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${selectedAddOns.includes(addon.id) ? "border-white bg-transparent" : "border-white/50 group-hover:border-white"}`}
                  >
                    {selectedAddOns.includes(addon.id) && (
                      <div className="w-2 h-2 bg-white" />
                    )}
                  </div>
                  <span className="text-white text-gh-desc font-manrope">
                    {addon.label}
                  </span>
                </div>
                <span className="text-white text-gh-desc font-manrope font-bold">
                  {formatBookAddOnPrice(addon.pricePaise)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* PRICE DETAILS */}
        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="text-white font-manrope font-bold text-gh-body mb-3">
            Price details
          </h4>
          {previewLoading ? (
            <p className="flex items-center gap-2 text-white/60 font-manrope text-gh-desc">
              <Loader2 className="w-4 h-4 animate-spin" /> Calculating price…
            </p>
          ) : serverPreview ? (
            <div className="space-y-2 text-gh-desc font-manrope">
              <div className="flex items-center justify-between text-white/90">
                <span className="text-white/80">Stay / package</span>
                <span className="font-bold text-white">
                  {formatPaise(displayBase)}
                </span>
              </div>
              {addOnTotal > 0 && (
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-white/80">Add On Experiences</span>
                  <span className="font-bold text-white">
                    {formatPaise(addOnTotal)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-white/90">
                <span className="text-white/80">GST</span>
                <span className="font-bold text-white">
                  {formatPaise(displayTax)}
                </span>
              </div>
              <div className="flex items-center justify-between text-white pt-2 border-t border-white/10">
                <span className="font-bold">Total</span>
                <span className="font-bold text-[#EFCD62]">
                  {formatPaise(displayTotal)}
                </span>
              </div>
              {serverPreview.payment.paymentPlan === "deposit" && (
                <p className="text-white/50 text-gh-label">
                  Pay now: {formatPaise(serverPreview.payment.depositPaise)} ·
                  Balance: {formatPaise(serverPreview.payment.balancePaise)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-white/50 font-manrope text-gh-desc">
              Select dates and add-ons to see server-calculated pricing.
            </p>
          )}
          <div className="flex items-center gap-3 text-white/50 text-gh-label font-manrope mt-4">
            <span>Cancel within 24 hours for refund</span>
            <span>Full Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white/5 p-4 flex items-start justify-between border border-transparent">
      <div className="flex flex-col gap-1">
        <p className="text-white font-manrope font-bold text-gh-body mb-1">
          {label}
        </p>
        <p className="text-white/80 font-manrope text-gh-desc">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="bg-[#1E4336] border border-white/20 px-4 py-2 text-gh-label font-bold tracking-widest text-white uppercase hover:bg-[#285848] transition-colors font-manrope"
      >
        EDIT
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Success screen
───────────────────────────────────────────────────────────────────── */
function SuccessScreen({
  bookingId,
  bookingToken,
  villaName,
  checkIn,
  checkOut,
  payPaise,
  guestName,
  guestEmail,
  guestPhone,
  onClose,
}: {
  bookingId: string;
  bookingToken: string;
  villaName: string;
  checkIn: BookingCalendarDate | null;
  checkOut: BookingCalendarDate | null;
  payPaise: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  onClose: () => void;
}) {
  const paymentMode = getClientPaymentGatewayMode();
  const isTestPay = paymentMode === "test";
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paidNote, setPaidNote] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>("pending");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  const shortRef = bookingId.slice(0, 8).toUpperCase();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const pollStatus = async () => {
      try {
        const res = await fetch(
          `/api/bookings/lookup?token=${encodeURIComponent(bookingToken)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          booking?: {
            status?: string;
            payment?: { status?: string };
          };
        };
        if (cancelled || !data.booking) return;
        setBookingStatus(data.booking.status ?? "pending");
        setPaymentStatus(data.booking.payment?.status ?? "pending");
        if (data.booking.status === "confirmed") {
          setPaidNote((current) =>
            current ??
            "Payment verified. Your booking is confirmed and has been synced for staff follow-up.",
          );
          return;
        }
        if (
          data.booking.status === "pending" ||
          data.booking.status === "on_hold"
        ) {
          timer = setTimeout(pollStatus, 4000);
        }
      } catch {
        timer = setTimeout(pollStatus, 5000);
      }
    };

    void pollStatus();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bookingToken]);

  const handleTestPay = async () => {
    setPayError(null);
    setPayBusy(true);
    try {
      const result = await confirmTestPayment({ bookingId, bookingToken });
      if (!result.ok) {
        setPayError(result.error ?? "Test payment could not be confirmed.");
        return;
      }
      setPaidNote(
        result.alreadyConfirmed
          ? "This booking is already confirmed. It should appear in the dashboard."
          : "Payment confirmed (test mode). Your booking is live in the dashboard, calendar, and payments.",
      );
    } catch {
      setPayError("Network error. Try again.");
    } finally {
      setPayBusy(false);
    }
  };

  const handleRazorpay = async () => {
    setPayError(null);
    setPayBusy(true);
    try {
      const receipt = `book-${bookingId.replace(/-/g, "").slice(0, 36)}`;
      const session = await initiatePayment(payPaise / 100, receipt, {
        bookingId,
      });

      if (
        !session.gatewayConfigured ||
        !session.razorpayOrderId ||
        !session.razorpayKeyId ||
        session.amountSubunits == null
      ) {
        // Server may be in simulated test mode (501) while checkout tried Razorpay —
        // fall back to instant test confirm so Pay does not soft-fail.
        if (paymentMode === "test") {
          const result = await confirmTestPayment({ bookingId, bookingToken });
          if (result.ok) {
            setPaidNote(
              result.alreadyConfirmed
                ? "This booking is already confirmed. It should appear in the dashboard."
                : "Payment confirmed (test mode). Your booking is live in the dashboard, calendar, and payments.",
            );
            return;
          }
        }
        setPayError(
          "Online payment is not available right now. Set PAYMENT_GATEWAY_MODE=razorpay_test with Razorpay keys, or use simulated test mode.",
        );
        return;
      }

      const paymentResult = await openRazorpayCheckout({
        keyId: session.razorpayKeyId,
        amountPaise: session.amountSubunits,
        currency: "INR",
        orderId: session.razorpayOrderId,
        name: "Jade Hospitainment",
        description: `Booking ${shortRef}`,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone.replace(/\s/g, ""),
        },
      });
      const verifyRes = await fetch("/api/payments/razorpay-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          bookingToken,
          ...paymentResult,
        }),
      });
      if (!verifyRes.ok) {
        const data = (await verifyRes.json().catch(() => ({}))) as {
          error?: string;
        };
        setPaidNote(
          "Payment submitted. We are verifying it now and will confirm your booking shortly.",
        );
        if (data.error) {
          setPayError(data.error);
        }
        return;
      }
      setPaidNote(
        "Payment received. We are confirming your booking now.",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "checkout_dismissed") {
        setPayError(null);
      } else {
        setPayError(
          msg || "Could not start payment. You can try again or we'll reach out.",
        );
      }
    } finally {
      setPayBusy(false);
    }
  };

  const handlePay = isTestPay ? handleTestPay : handleRazorpay;
  const isConfirmed = bookingStatus === "confirmed";
  const title = isConfirmed ? "Booking Confirmed" : "Reservation Received";
  const subtitle = isConfirmed
    ? `Your stay at ${villaName} is confirmed.`
    : `Your dates at ${villaName} are on hold while payment is verified.`;

  return (
    <div className="h-[100svh] bg-[#0B2C23] flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-8" data-lenis-prevent>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center max-w-sm w-full"
      >
        <div className="w-20 h-20 rounded-full border-2 border-[#EFCD62] flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-[#EFCD62]" />
        </div>
        <h1 className="font-philosopher text-white text-gh-h1 mb-2.5">
          {title}
        </h1>
        <p className="text-white/60 font-manrope text-gh-body mb-2">
          <span className="text-white font-bold">{subtitle}</span>
        </p>
        <p className="text-white/60 font-manrope text-gh-body mb-6">
          {formatDate(checkIn)} → {formatDate(checkOut)}
        </p>
        <div className="bg-white/5 border border-white/10 px-6 py-4 mb-3 w-full">
          <p className="text-white/40 text-gh-label font-manrope uppercase tracking-widest mb-1">
            Booking reference
          </p>
          <p
            className="text-[#EFCD62] font-manrope font-bold text-gh-body"
            title={bookingId}
          >
            {shortRef}
          </p>
          <p className="text-white/35 text-[10px] font-manrope break-all mt-2 text-left">
            {bookingId}
          </p>
        </div>

        <div className="mb-4 w-full border border-white/10 bg-white/5 px-4 py-3 text-left">
          <p className="text-white/40 text-gh-label font-manrope uppercase tracking-widest mb-1">
            Current status
          </p>
          <p className="text-white text-gh-desc font-manrope">
            Booking: <span className="font-bold uppercase">{bookingStatus}</span>
            {" · "}Payment: <span className="font-bold uppercase">{paymentStatus}</span>
          </p>
        </div>

        {paymentMode !== "production" && (
          <p className="text-amber-200/80 text-[11px] font-manrope mb-3 px-2 py-2 border border-amber-400/25 bg-amber-400/5 w-full">
            Payment gateway: <strong>{paymentModeLabel(paymentMode)}</strong>
            {isTestPay
              ? " — Pay confirms instantly (no Razorpay). Set PAYMENT_GATEWAY_MODE=production at go-live."
              : " — Use Razorpay test card details. Switch to production before launch."}
          </p>
        )}

        {paidNote ? (
          <p className="text-emerald-300/90 text-gh-label font-manrope mb-5">
            {paidNote}
          </p>
        ) : (
          <>
            <p className="text-white/50 text-gh-label font-manrope mb-2.5">
              {isTestPay
                ? `Pay ${formatPaise(payPaise)} (test mode) to confirm this booking in the dashboard.`
                : `Pay ${formatPaise(payPaise)} now with Razorpay to move this reservation from pending to confirmed.`}
            </p>
            {payError && (
              <p className="text-amber-200/90 text-gh-label font-manrope mb-3 px-1">
                {payError}
              </p>
            )}
            <PrimaryButton
              type="button"
              width="form"
              withArrow={false}
              disabled={payBusy}
              onClick={handlePay}
              className="mb-2.5"
            >
              {payBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              {payBusy
                ? isTestPay
                  ? "CONFIRMING…"
                  : "OPENING…"
                : isTestPay
                  ? `PAY ${formatPaise(payPaise)} (TEST)`
                  : `PAY ${formatPaise(payPaise)}`}
            </PrimaryButton>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full border border-white/20 text-white py-3.5 font-manrope font-bold text-gh-label tracking-widest uppercase hover:bg-white/10 transition-colors"
        >
          BACK TO HOME
        </button>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main BookPage Content
───────────────────────────────────────────────────────────────────── */
function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const villaParam = searchParams?.get("villa") ?? null;
  const isVillaPreSelected = !!villaParam;

  const { dateRange, setDateRange, guests, setGuests, resetBooking } =
    useBooking();

  const stepParam = (searchParams?.get("step") ?? null) as Step | null;

  // Resolve the correct initial step.
  // NOTE: useState initializer runs on both server and client — keep it deterministic.
  // We cannot read BookingContext here for the initial value because the context state
  // starts as default on the server (no dates/guests), so doing so would cause a
  // hydration mismatch. Instead, we start at the URL-specified step (or "dates"),
  // and auto-advance in a useEffect after hydration.
  const getInitialStep = (): Step => {
    if (
      stepParam &&
      ["dates", "guests", "details", "review"].includes(stepParam)
    ) {
      return stepParam as Step;
    }
    return "dates";
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const [selectedVillaId, setSelectedVillaId] = useState<string | null>(
    villaParam,
  );
  const [details, setDetails] = useState<UserDetails>({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    bookingToken: string;
    depositPaise: number;
    totalPaise: number;
  } | null>(null);
  const [serverPreview, setServerPreview] = useState<ServerPreview | null>(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [detailsForceErrors, setDetailsForceErrors] = useState(false);
  const [selectedVillaLive, setSelectedVillaLive] = useState<Villa | null>(null);
  const [liveBookable, setLiveBookable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!selectedVillaId) {
      setSelectedVillaLive(null);
      setLiveBookable(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/public/villas/${encodeURIComponent(selectedVillaId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { villa?: Villa } | null) => {
        if (cancelled) return;
        if (data?.villa) {
          setSelectedVillaLive(data.villa);
          setLiveBookable(
            isVillaRecordBookable(data.villa as { id: string; bookable?: boolean }),
          );
        } else {
          setSelectedVillaLive(null);
          setLiveBookable(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedVillaLive(null);
          setLiveBookable(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedVillaId]);

  const villaBookingDisabled =
    selectedVillaId !== null &&
    (liveBookable === false ||
      (liveBookable === null && !isVillaBookable(selectedVillaId)));

  useEffect(() => {
    if (villaParam) setSelectedVillaId(villaParam);
  }, [villaParam]);

  useEffect(() => {
    if (step !== "details") setDetailsForceErrors(false);
  }, [step]);

  useEffect(() => {
    if (!villaBookingDisabled) return;
    if (step !== "dates") setStep("dates");
    if (dateRange.checkIn || dateRange.checkOut) {
      setDateRange({ checkIn: null, checkOut: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaBookingDisabled, villaParam]);

  // After hydration: if villa is pre-selected and context already has dates + guests
  // (user came through the flow: /book → dates → guests → /retreats/ → BOOK VILLA),
  // jump straight to details. Safe to do in useEffect (client-only).
  useEffect(() => {
    if (
      villaParam &&
      !villaBookingDisabled &&
      !stepParam &&
      dateRange.checkIn &&
      dateRange.checkOut &&
      guests.adults > 0 &&
      step === "dates"
    ) {
      setStep("details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVillaFallback =
    VILLAS.find((v) => v.id === selectedVillaId) ?? null;
  const selectedVilla = selectedVillaLive ?? selectedVillaFallback;
  const bookingVillaSlug =
    selectedVilla?.slug ??
    (selectedVillaId ? slugForPublicVillaId(selectedVillaId) : null);

  const basePrice = selectedVilla
    ? parseInt(
        (selectedVilla.pricing?.stay?.packages?.[0]?.price ?? "99000").replace(
          /[^0-9]/g,
          "",
        ),
      ) || 99000
    : 99000;

  const addOnTotal = estimateAddOnPaise(
    selectedAddOns,
    guests.adults + guests.children,
  );

  const handleClose = useSafeBack(villaListingPath());

  const handleReset = () => {
    setStep("dates");
    resetBooking();
    if (!villaParam) setSelectedVillaId(null);
    setDetails({ fullName: "", phone: "", email: "", notes: "" });
    setSelectedAddOns([]);
    setSubmitError(null);
    setDetailsForceErrors(false);
  };

  const goNextFromGuests = () => {
    if (villaBookingDisabled) return;
    if (isVillaPreSelected) {
      setStep("details");
    } else {
      // No villa pre-selected — send to listing results (skip hero).
      router.push(villaListingResultsPath());
    }
  };

  const goBackFromDetails = () => {
    if (isVillaPreSelected) {
      setStep("guests");
    } else {
      router.push(villaListingResultsPath());
    }
  };

  const buildPreviewPayload = useCallback(() => {
    if (!bookingVillaSlug || !dateRange.checkIn || !dateRange.checkOut) {
      return null;
    }
    return {
      villaSlug: bookingVillaSlug,
      bookingType: "stay" as const,
      checkIn: dateRange.checkIn.iso,
      checkOut: dateRange.checkOut.iso,
      guests: guests.adults + guests.children,
      adults: guests.adults,
      children: guests.children,
      pets: guests.pets,
      addOns: selectedAddOns.map((id) => ({ id, quantity: 1 })),
      paymentPlan: "full" as const,
    };
  }, [bookingVillaSlug, dateRange, guests, selectedAddOns]);

  useEffect(() => {
    if (step !== "review") return;
    const payload = buildPreviewPayload();
    if (!payload) return;

    let cancelled = false;
    setPreviewLoading(true);
    fetch("/api/bookings/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!cancelled && res.ok) {
          setServerPreview(data as ServerPreview);
        }
      })
      .catch(() => {
        if (!cancelled) setServerPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, buildPreviewPayload]);

  /* ── Submit booking to API ── */
  const handlePayNow = useCallback(async () => {
    if (!selectedVilla || !bookingVillaSlug || !dateRange.checkIn || !dateRange.checkOut) return;
    if (villaBookingDisabled) {
      setSubmitError(
        "Online booking is not available for this villa. Please enquire instead.",
      );
      return;
    }
    if (!isBookingDetailsValid(details)) {
      setDetailsForceErrors(true);
      setSubmitError("Please correct your contact details before paying.");
      setStep("details");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      villaSlug: bookingVillaSlug,
      bookingType: "stay" as const,
      checkIn: dateRange.checkIn.iso,
      checkOut: dateRange.checkOut.iso,
      guests: guests.adults + guests.children,
      adults: guests.adults,
      children: guests.children,
      pets: guests.pets,
      fullName: details.fullName,
      phone: details.phone,
      email: details.email,
      notes: details.notes,
      addOns: selectedAddOns.map((id) => ({ id, quantity: 1 })),
      paymentPlan: "full" as const,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (!data.bookingId || !data.bookingToken) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setBookingResult({
        id: data.bookingId,
        bookingToken: data.bookingToken,
        depositPaise: data.payment?.depositPaise ?? data.pricing?.totalPaise ?? 0,
        totalPaise: data.pricing?.totalPaise ?? 0,
      });
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    bookingVillaSlug,
    guests,
    details,
    selectedAddOns,
    villaBookingDisabled,
    dateRange,
    selectedVilla,
  ]);

  /* ── Show success screen ── */
  if (bookingResult) {
    const payPaise =
      bookingResult.depositPaise || bookingResult.totalPaise;
    return (
      <SuccessScreen
        bookingId={bookingResult.id}
        bookingToken={bookingResult.bookingToken}
        villaName={selectedVilla?.name ?? "Jade Villa"}
        checkIn={dateRange.checkIn}
        checkOut={dateRange.checkOut}
        payPaise={payPaise}
        guestName={details.fullName}
        guestEmail={details.email}
        guestPhone={details.phone}
        onClose={() => router.push("/")}
      />
    );
  }

  /* ── Bottom action bar ── */
  const renderBottomBar = () => {
    if (step === "dates") {
      const canNext =
        !villaBookingDisabled && !!(dateRange.checkIn && dateRange.checkOut);
      return (
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/60 text-gh-body font-manrope min-w-0">
            {villaBookingDisabled ? (
              <span className="text-white/45 text-gh-label">
                Booking unavailable for this villa
              </span>
            ) : (
              <>
                <span>{formatDate(dateRange.checkIn)}</span>
                <span className="mx-2 text-white/30">to</span>
                <span>{formatDate(dateRange.checkOut)}</span>
              </>
            )}
          </div>
          {villaBookingDisabled ? (
            <PrimaryButton
              href="tel:08970663366"
              width="compact"
              withArrow={false}
            >
              ENQUIRE
            </PrimaryButton>
          ) : (
            <PrimaryButton
              width="compact"
              withArrow={false}
              disabled={!canNext}
              onClick={() => setStep("guests")}
            >
              NEXT
            </PrimaryButton>
          )}
        </div>
      );
    }

    if (step === "guests") {
      const guestLabel =
        guests.adults + guests.children > 0
          ? `${guests.adults} Guest${guests.adults !== 1 ? "s" : ""}${guests.children > 0 ? `, ${guests.children} Children` : ""}`
          : "-- --";
      // Label depends on whether villa is already chosen
      const nextLabel = isVillaPreSelected ? "APPLY" : "NEXT";
      return (
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-gh-body font-manrope">
            {guestLabel}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={() => setStep("dates")}
              className="px-5 py-2.5 text-gh-label font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors font-manrope"
            >
              BACK
            </button>
            <PrimaryButton
              width="compact"
              withArrow={false}
              disabled={guests.adults === 0}
              onClick={goNextFromGuests}
            >
              {nextLabel}
            </PrimaryButton>
          </div>
        </div>
      );
    }

    if (step === "details") {
      const canProceed = isBookingDetailsValid(details);
      return (
        <div className="flex flex-col gap-2.5">
          <p className="text-white/35 text-[10px] md:text-[11px] font-manrope text-center sm:text-left px-1">
            Fields marked * are required. Continue is enabled once name, phone,
            and email are valid.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[#EFCD62] font-manrope text-gh-label font-bold">
              {formatRupees(basePrice)} onwards
            </span>
            <div className="flex gap-2.5">
              <button
                onClick={goBackFromDetails}
                className="px-5 py-2.5 text-gh-label font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors font-manrope"
              >
                BACK
              </button>
              <PrimaryButton
                width="compact"
                withArrow={false}
                variant={canProceed ? "primary" : "secondary"}
                onClick={() => {
                  if (!canProceed) {
                    setDetailsForceErrors(true);
                    return;
                  }
                  setDetailsForceErrors(false);
                  setStep("review");
                }}
                className={
                  canProceed
                    ? undefined
                    : "!opacity-100 !pointer-events-auto cursor-pointer"
                }
              >
                CONTINUE
              </PrimaryButton>
            </div>
          </div>
        </div>
      );
    }

    if (step === "review") {
      const total = serverPreview?.pricing.totalPaise ?? 0;
      return (
        <div className="flex flex-col gap-2.5 w-full">
          {/* Error message */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-2 text-red-400 text-gh-label font-manrope bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between w-full gap-3">
            <div className="text-white font-manrope text-gh-label font-bold tracking-wide whitespace-nowrap">
              Total: {total > 0 ? formatPaise(total) : previewLoading ? "…" : "—"}
            </div>
            <div className="flex items-center gap-5 sm:gap-6 shrink-0">
              <button
                onClick={() => setStep("details")}
                className="text-gh-label font-bold tracking-[0.2em] text-[#EFCD62] uppercase transition-colors font-manrope hover:text-white"
              >
                BACK
              </button>
              <PrimaryButton
                width="compact"
                withArrow={false}
                disabled={isSubmitting}
                onClick={handlePayNow}
                className="outline outline-1 outline-[#EFCD62] outline-offset-[3px] hover:outline-white"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />}
                {isSubmitting ? "CONFIRMING…" : "PAY NOW"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[100svh] bg-[#0B2C23] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#0B2C23] shrink-0">
        <div className="w-full max-w-[720px] mx-auto">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10">
            <h2 className="text-white text-gh-h2 font-philosopher leading-none">
              {step === "dates" && "Select Dates"}
              {step === "guests" && "Total Guests"}
              {step === "details" && "Your Details"}
              {step === "review" && "Review & Pay"}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-widest uppercase hover:text-white transition-colors"
              >
                RESET
              </button>
              <a
                href="tel:08970663366"
                className="text-white hover:text-[#EFCD62] transition-colors"
              >
                <Phone className="w-5 h-5" strokeWidth={1.5} aria-hidden />
              </a>
              <button
                onClick={handleClose}
                className="text-white hover:text-[#EFCD62] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Legend — only on dates step */}
          {step === "dates" && (
            <div className="flex justify-start items-center gap-2 md:gap-3 px-5 sm:px-6 py-3 md:py-4 text-gh-label text-[#A6C0B5] font-manrope font-medium border-b border-white/10">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#165040] rounded-[2px] shrink-0" />{" "}
                Available
              </span>
              <span className="flex items-center gap-2 relative">
                <span className="w-4 h-4 bg-[#165040]/50 rounded-[2px] overflow-hidden relative shrink-0">
                  <span className="block w-[150%] h-[1px] bg-[#A6C0B5]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                </span>
                Unavailable
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#EFCD62] rounded-[2px] shrink-0" />{" "}
                Selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full max-w-[720px] mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "dates" && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <StepDates
                dateRange={dateRange}
                setDateRange={setDateRange}
                villaId={bookingVillaSlug}
                bookingDisabled={villaBookingDisabled}
              />
            </motion.div>
          )}
          {step === "guests" && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col min-h-0"
            >
              <StepGuests guests={guests} setGuests={setGuests} />
            </motion.div>
          )}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col min-h-0"
            >
              <StepDetails
                details={details}
                setDetails={setDetails}
                forceShowErrors={detailsForceErrors}
              />
            </motion.div>
          )}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col min-h-0"
            >
              <StepReview
                dateRange={dateRange}
                guests={guests}
                details={details}
                selectedVilla={selectedVilla}
                bookingVillaSlug={bookingVillaSlug}
                goToStep={setStep}
                selectedAddOns={selectedAddOns}
                setSelectedAddOns={setSelectedAddOns}
                serverPreview={serverPreview}
                previewLoading={previewLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B2C23] z-50">
        <div className="w-full max-w-[720px] mx-auto border-t border-white/10">
          <div className="relative px-4 sm:px-5 py-3 sm:py-4">
            <div className="absolute left-0 right-0 top-0 -translate-y-[1px]">
              <StepDots step={step} />
            </div>
            {renderBottomBar()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B2C23] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#EFCD62] animate-spin" />
        </div>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}
