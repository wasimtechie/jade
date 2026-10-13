"use client";

import { CalendarDays, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  buildLeadSections,
  summarizeLeadPayload,
  type LeadKind,
  type LeadSection,
} from "@/lib/leads/presentation";
import { DashStatusChip } from "../form";
import { DashboardModalHeader } from "../ui/DashboardModalHeader";

type LeadRowLike = {
  id: string;
  kind: LeadKind;
  sourceLabel: string;
  email: string | null;
  name: string;
  phone: string | null;
  status: string;
  staffNotes: string;
  payload: Record<string, unknown>;
  photoCount?: number;
  createdAt: string | null;
};

const STATUS_VARIANT: Record<string, "info" | "success" | "warning" | "neutral"> = {
  new: "info",
  contacted: "warning",
  closed: "success",
};

function SectionCard({ section }: { section: LeadSection }) {
  return (
    <div className="rounded-sm border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--dash-accent)]">
        {section.title}
      </p>
      <div className="space-y-3">
        {section.items.map((item) => (
          <div
            key={`${section.title}-${item.label}`}
            className="border-b border-white/8 pb-3 last:border-b-0 last:pb-0"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              {item.label}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/88">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadDetailView({
  lead,
  notesDraft,
  statusDraft,
  canWrite,
  saving,
  onNotesChange,
  onStatusChange,
  onSave,
  onClose,
}: {
  lead: LeadRowLike;
  notesDraft: string;
  statusDraft: string;
  canWrite: boolean;
  saving: boolean;
  onNotesChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const sections = buildLeadSections(lead.payload, lead.kind);
  const highlights = summarizeLeadPayload(lead.payload, lead.kind);

  return (
    <div className={`${dash.modalOverlay} dashboard-modal-overlay--elevated`}>
      <div className={`${dash.modal} ${dash.modalWide} max-h-[90dvh]`}>
        <div className={dash.modalFrame}>
          <DashboardModalHeader
            section={lead.sourceLabel}
            title={lead.name}
            description={lead.email ?? lead.phone ?? "No contact details"}
            onClose={onClose}
          />

          <div className={`${dash.modalBody} space-y-5`}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Status
                </p>
                <DashStatusChip variant={STATUS_VARIANT[lead.status] ?? "neutral"}>
                  {lead.status}
                </DashStatusChip>
              </div>
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Contact
                </p>
                <div className="space-y-1.5 text-sm text-white/82">
                  {lead.email ? (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[var(--dash-accent)]" />
                      <span className="break-all">{lead.email}</span>
                    </p>
                  ) : null}
                  {lead.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[var(--dash-accent)]" />
                      <span>{lead.phone}</span>
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Received
                </p>
                <p className="flex items-center gap-2 text-sm text-white/82">
                  <CalendarDays className="h-4 w-4 text-[var(--dash-accent)]" />
                  <span>
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </p>
              </div>
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Quick summary
                </p>
                {highlights.length ? (
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-xs text-white/82"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/55">No quick summary available.</p>
                )}
                {lead.photoCount ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/82">
                    <MapPin className="h-4 w-4 text-[var(--dash-accent)]" />
                    <span>{lead.photoCount} photo attachments</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {sections.map((section) => (
                <SectionCard key={section.title} section={section} />
              ))}
            </div>

            {canWrite ? (
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--dash-accent)]">
                  Staff follow-up
                </p>
                <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40">
                    Status
                    <select
                      value={statusDraft}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className={`${dash.inputCompact} mt-1 w-full`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-widest text-white/40">
                    Staff notes
                    <textarea
                      value={notesDraft}
                      onChange={(e) => onNotesChange(e.target.value)}
                      rows={5}
                      className={`${dash.inputCompact} mt-1 w-full`}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={onSave}
                  className={`${dash.btn} ${dash.btnAccent} mt-4 w-full sm:w-auto`}
                >
                  {saving ? "Saving..." : "Save update"}
                </button>
              </div>
            ) : lead.staffNotes ? (
              <div className="rounded-sm border border-white/10 bg-black/20 p-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--dash-accent)]">
                  <StickyNote className="h-4 w-4" />
                  Staff notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/82">
                  {lead.staffNotes}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
