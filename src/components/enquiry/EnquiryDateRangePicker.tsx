"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  ENQUIRY_CALENDAR_DAYS,
  ENQUIRY_CALENDAR_MONTHS,
  formatEnquiryDate,
  getDaysInMonth,
  getEnquiryDateDisplayLabel,
  getFirstDayOfMonth,
  isBetween,
  sameDay,
  startOfDay,
} from "@/lib/enquiryDateRange";
import {
  getFieldShellClass,
  getFieldTrailingIconClass,
  getFloatingLabelFloatedClass,
  getFloatingLabelIdleClass,
  JADE_FORM_INPUT_FOOTER_CLASS,
  JADE_FORM_TRAILING_ICON_INSET,
  JADE_FORM_WARN,
  type JadeFormTheme,
} from "@/lib/jadeFormTokens";

type EnquiryDateRangePickerProps = {
  label: string;
  checkIn: Date | null;
  checkOut: Date | null;
  onDatesChange: (checkIn: Date | null, checkOut: Date | null) => void;
  theme?: "footer" | "overlay";
  invalid?: boolean;
  className?: string;
};

export default function EnquiryDateRangePicker({
  label,
  checkIn,
  checkOut,
  onDatesChange,
  theme = "footer",
  invalid = false,
  className,
}: EnquiryDateRangePickerProps) {
  const [today, setToday] = useState<Date>(() => new Date(2026, 0, 1));
  const [calMonth, setCalMonth] = useState<Date>(() => new Date(2026, 0, 1));
  const [showCalendar, setShowCalendar] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = startOfDay(new Date());
    setToday(t);
    setCalMonth(new Date(t.getFullYear(), t.getMonth(), 1));
  }, []);

  useEffect(() => {
    if (!showCalendar) return;
    const handler = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar]);

  const dateLabel = getEnquiryDateDisplayLabel(checkIn, checkOut);
  const hasValue = Boolean(checkIn);
  const isOverlay = theme === "overlay";
  const formTheme: JadeFormTheme = isOverlay ? "overlayGreen" : "footerCharcoal";
  const labelFloated = hasValue || showCalendar || focused;

  const handleDayClick = (day: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      onDatesChange(day, null);
      return;
    }
    if (day < checkIn) {
      onDatesChange(day, checkIn);
      setShowCalendar(false);
      return;
    }
    onDatesChange(checkIn, day);
    if (!sameDay(day, checkIn)) setShowCalendar(false);
  };

  const triggerClass = clsx(
    "peer w-full min-w-0 text-left font-manrope focus:outline-none transition-colors",
    isOverlay
      ? clsx(
          "bg-transparent pl-4 py-3.5 text-gh-body rounded-sm border-0",
          JADE_FORM_TRAILING_ICON_INSET,
          hasValue ? "text-white/80" : "text-transparent",
        )
      : clsx(
          JADE_FORM_INPUT_FOOTER_CLASS,
          JADE_FORM_TRAILING_ICON_INSET,
          "rounded-none",
          hasValue ? "text-white/80" : "text-transparent",
        ),
  );

  return (
    <div className={clsx("relative", className)} ref={calendarRef}>
      <div
        className={getFieldShellClass({
          invalid,
          showError: invalid,
          variant: isOverlay ? "standard" : "footer",
        })}
      >
        <button
          type="button"
          aria-expanded={showCalendar}
          aria-label={hasValue ? `${label}: ${dateLabel}` : label}
          onClick={() => setShowCalendar((v) => !v)}
          className={triggerClass}
        >
          <span className="block truncate" aria-hidden={!hasValue}>
            {hasValue ? dateLabel : "\u00a0"}
          </span>
        </button>
        <CalendarDays
          aria-hidden
          className={getFieldTrailingIconClass(showCalendar || hasValue)}
        />
        <label
          className={
            labelFloated
              ? getFloatingLabelFloatedClass(formTheme)
              : getFloatingLabelIdleClass(formTheme)
          }
        >
          {label}
          {invalid ? (
            <span className="ml-1" style={{ color: JADE_FORM_WARN }}>
              *
            </span>
          ) : null}
        </label>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className={clsx(
              "absolute left-0 top-[calc(100%+8px)] z-50 min-w-[17.5rem] border border-white/10 bg-[#1C1F22] p-5 shadow-2xl",
              isOverlay
                ? "w-full max-w-[min(100vw-3rem,22rem)]"
                : "w-[calc(200%+0.75rem)] max-w-[min(100vw-2rem,22rem)] sm:w-[calc(200%+1.25rem)] sm:max-w-[min(100vw-2rem,24rem)]",
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() =>
                  setCalMonth(
                    new Date(
                      calMonth.getFullYear(),
                      calMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-[#EFCD62] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="font-manrope text-gh-body font-semibold text-white tracking-widest uppercase">
                {ENQUIRY_CALENDAR_MONTHS[calMonth.getMonth()]}{" "}
                {calMonth.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() =>
                  setCalMonth(
                    new Date(
                      calMonth.getFullYear(),
                      calMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-[#EFCD62] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {ENQUIRY_CALENDAR_DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center font-manrope text-gh-label text-white/30 tracking-widest py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({
                length: getFirstDayOfMonth(
                  calMonth.getFullYear(),
                  calMonth.getMonth(),
                ),
              }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}

              {Array.from({
                length: getDaysInMonth(
                  calMonth.getFullYear(),
                  calMonth.getMonth(),
                ),
              }).map((_, i) => {
                const day = new Date(
                  calMonth.getFullYear(),
                  calMonth.getMonth(),
                  i + 1,
                );
                const isStart = sameDay(day, checkIn);
                const isEnd = sameDay(day, checkOut);
                const isToday = sameDay(day, today);
                const isPast = day < today;
                const effectiveEnd = checkOut ?? hoverDate;
                const inRange =
                  checkIn && !checkOut
                    ? isBetween(day, checkIn, effectiveEnd)
                    : isBetween(day, checkIn, checkOut);

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPast}
                    onClick={() => !isPast && handleDayClick(day)}
                    onMouseEnter={() => setHoverDate(day)}
                    onMouseLeave={() => setHoverDate(null)}
                    className={clsx(
                      "relative h-9 w-full font-manrope text-gh-label transition-all duration-150",
                      isPast
                        ? "text-white/15 cursor-not-allowed"
                        : isStart || isEnd
                          ? "bg-[#EFCD62] text-[#1C1F22] font-bold z-10"
                          : inRange
                            ? "bg-[#EFCD62]/15 text-white"
                            : isToday
                              ? "text-[#EFCD62] font-semibold hover:bg-white/10"
                              : "text-white/70 hover:bg-white/10",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="min-w-0 font-manrope text-gh-label leading-snug text-white/30">
                {!checkIn
                  ? "Select check-in date"
                  : !checkOut
                    ? "Select check-out (or tap Done for one night)"
                    : `${formatEnquiryDate(checkIn)} → ${formatEnquiryDate(checkOut)}`}
              </p>
              <div className="flex shrink-0 items-center gap-3">
                {checkIn && !checkOut ? (
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="font-manrope text-gh-label text-[#EFCD62] hover:text-white transition-colors tracking-widest uppercase"
                  >
                    Done
                  </button>
                ) : null}
                {(checkIn || checkOut) && (
                  <button
                    type="button"
                    onClick={() => onDatesChange(null, null)}
                    className="font-manrope text-gh-label text-white/30 hover:text-[#EFCD62] transition-colors tracking-widest uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
