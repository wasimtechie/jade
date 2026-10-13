"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { villaDeleteConfirmLabel } from "@/lib/villas/villaDeletionConfirm";
import { DashFormNotice, DashSectionCard } from "@/components/dashboard/form";
import { VillaDeleteConfirmDialog } from "./VillaDeleteConfirmDialog";

type VillaDeletePanelProps = {
  slug: string;
  name: string;
  shortName?: string;
  allowed: boolean;
  blockedReason?: string;
  onDeleted: () => void;
};

export function VillaDeletePanel({
  slug,
  name,
  shortName,
  allowed,
  blockedReason,
  onDeleted,
}: VillaDeletePanelProps) {
  const confirmName = villaDeleteConfirmLabel({ name, shortName });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (confirmedName: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await dashboardFetch(`/api/dashboard/villas/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName: confirmedName }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setConfirmOpen(false);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DashSectionCard
        title="Delete property"
        description="Remove this property from the dashboard and public website."
        badge="Danger zone"
      >
        {allowed ? (
          <div className={dash.stack}>
            <p className="font-manrope text-sm leading-relaxed text-white/60">
              Deletes <strong className="text-white/80">{confirmName}</strong> (
              <span className="font-mono text-xs">{slug}</span>). The property
              will disappear from /retreats/ and booking. Past bookings are kept for
              records. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setConfirmOpen(true);
              }}
              className={`${dash.btn} ${dash.btnDense} inline-flex w-fit items-center gap-2 border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
            >
              <Trash2 className="h-4 w-4" />
              Delete property permanently
            </button>
          </div>
        ) : (
          <DashFormNotice variant="warning">
            {blockedReason ??
              "This property cannot be deleted from the dashboard."}
          </DashFormNotice>
        )}
        {error && !confirmOpen ? (
          <p className="mt-3 font-manrope text-sm text-red-400">{error}</p>
        ) : null}
      </DashSectionCard>

      <VillaDeleteConfirmDialog
        open={confirmOpen}
        propertyName={confirmName}
        slug={slug}
        busy={busy}
        error={error}
        onConfirm={(confirmedName) => void handleDelete(confirmedName)}
        onCancel={() => {
          if (!busy) {
            setConfirmOpen(false);
            setError(null);
          }
        }}
      />
    </>
  );
}
