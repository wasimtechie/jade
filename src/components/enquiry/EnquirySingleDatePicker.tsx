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
  getFirstDayOfMonth,
  sameDay,
  startOfDay,
} from "@/lib/enquiryDateRange";
import {
  getFieldShellClass,
  getFieldTrailingIconClass,
  getFloatingLabelFloatedClass,
  getFloatingLabelIdleClass,
  JADE_FORM_INPUT_CLASS,
  JADE_FORM_INPUT_FOOTER_CLASS,
  JADE_FORM_TRAILING_ICON_INSET,
  JADE_FORM_WARN,
  type JadeFormTheme,
} from "@/lib/jadeFormTokens";

type EnquirySingleDatePickerTheme = "footer" | "experienceCharcoal";

type Props = {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  theme?: EnquirySingleDatePickerTheme;
  invalid?: boolean;
  className?: string;
};

export default function EnquirySingleDatePicker({
  label,
  value,
  onChange,
  theme = "footer",
  invalid = false,
  className,
}: Props) {
  const [today, setToday] = useState<Date>(() => new Date());
  const [calMonth, setCalMonth] = useState<Date>(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const isFooter = theme === "footer";
  const formTheme: JadeFormTheme = isFooter
    ? "footerCharcoal"
    : "experienceCharcoal";

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

  const hasValue = Boolean(value);
  const labelFloated = hasValue || showCalendar;
  const displayLabel = hasValue ? formatEnquiryDate(value) : "\u00a0";

  const triggerClass = clsx(
    "peer w-full min-w-0 text-left font-manrope focus:outline-none transition-colors",
    isFooter
      ? clsx(
          JADE_FORM_INPUT_FOOTER_CLASS,
          JADE_FORM_TRAILING_ICON_INSET,
          "rounded-none",
          hasValue ? "text-white/80" : "text-transparent",
        )
      : clsx(
          JADE_FORM_INPUT_CLASS,
          JADE_FORM_TRAILING_ICON_INSET,
          "border-0 bg-transparent",
          hasValue ? "text-white" : "text-transparent",
        ),
  );

  const handleDayClick = (day: Date) => {
    onChange(day);
    setShowCalendar(false);
  };

  return (
    <div className={clsx("relative", className)} ref={calendarRef}>
      <div
        className={getFieldShellClass({
          invalid,
          showError: invalid,
          variant: isFooter ? "footer" : "standard",
        })}
      >
        <button
          type="button"
          aria-expanded={showCalendar}
          aria-label={hasValue ? `${label}: ${formatEnquiryDate(value)}` : label}
          onClick={() => setShowCalendar((v) => !v)}
          className={triggerClass}
        >
          <span className="block truncate" aria-hidden={!hasValue}>
            {displayLabel}
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
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-full max-w-[min(100vw-3rem,22rem)] border border-white/10 bg-[#1C1F22] p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
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
                className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-[#EFCD62]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="font-manrope text-gh-body font-semibold uppercase tracking-widest text-white">
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
                className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-[#EFCD62]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7">
              {ENQUIRY_CALENDAR_DAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center font-manrope text-gh-label tracking-widest text-white/30"
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
                const isSelected = sameDay(day, value);
                const isToday = sameDay(day, today);
                const isPast = day < today;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPast}
                    onClick={() => !isPast && handleDayClick(day)}
                    className={clsx(
                      "relative h-9 w-full font-manrope text-gh-label transition-all duration-150",
                      isPast
                        ? "cursor-not-allowed text-white/15"
                        : isSelected
                          ? "z-10 bg-[#EFCD62] font-bold text-[#1C1F22]"
                          : isToday
                            ? "font-semibold text-[#EFCD62] hover:bg-white/10"
                            : "text-white/70 hover:bg-white/10",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="font-manrope text-gh-label text-white/30">
                {hasValue
                  ? formatEnquiryDate(value)
                  : "Select event date"}
              </p>
              {hasValue ? (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="shrink-0 font-manrope text-gh-label uppercase tracking-widest text-white/30 transition-colors hover:text-[#EFCD62]"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
