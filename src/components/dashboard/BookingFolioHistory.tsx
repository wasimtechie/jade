"use client";

import {
  Building2,
  CreditCard,
  Globe,
  User,
  Users,
} from "lucide-react";
import type { BookingHistoryEntry } from "@/lib/bookings/bookingHistory";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardPanel } from "./DashboardPanel";

const ACTOR_ICON: Record<BookingHistoryEntry["actorType"], typeof User> = {
  staff: User,
  guest: User,
  ota: Globe,
  payment: CreditCard,
  system: Building2,
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type BookingFolioHistoryProps = {
  entries: BookingHistoryEntry[];
};

export function BookingFolioHistory({ entries }: BookingFolioHistoryProps) {
  return (
    <DashboardPanel pad className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className={dash.label}>Activity history</h2>
        <span className="font-manrope text-xs text-white/45">
          {entries.length} event{entries.length === 1 ? "" : "s"}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="font-manrope text-sm text-white/50">
          No activity recorded yet for this booking.
        </p>
      ) : (
        <ol className="booking-folio-history relative space-y-0 border-l border-white/10 pl-6">
          {entries.map((entry, i) => {
            const Icon = ACTOR_ICON[entry.actorType] ?? Users;
            const isCancel = entry.action === "booking.cancel";
            const isCreate = entry.action === "booking.create" || entry.action === "milestone.created";

            return (
              <li
                key={entry.id}
                className={`relative pb-6 last:pb-0 ${i === entries.length - 1 ? "" : ""}`}
              >
                <span
                  className={`absolute -left-[1.6rem] top-1 flex h-3 w-3 rounded-full border-2 ${
                    isCancel
                      ? "border-red-400/60 bg-red-500/30"
                      : isCreate
                        ? "border-emerald-400/60 bg-emerald-500/30"
                        : "border-[var(--dash-accent-border)] bg-[var(--dash-accent-muted)]"
                  }`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-manrope text-sm font-semibold text-white/90">
                      {entry.title}
                    </p>
                    {entry.detail && (
                      <p className="mt-1 font-manrope text-sm text-white/55">
                        {entry.detail}
                      </p>
                    )}
                  </div>
                  <time
                    className="shrink-0 font-manrope text-xs text-white/40"
                    dateTime={entry.at}
                  >
                    {fmtDateTime(entry.at)}
                  </time>
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 font-manrope text-xs uppercase tracking-widest text-white/40">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {entry.actor ?? "System"}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </DashboardPanel>
  );
}
