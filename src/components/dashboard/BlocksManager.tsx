"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Blocks, Loader2, Plus, Trash2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { nightCount } from "@/lib/bookingDates";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { roleCanWrite } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardIconButton } from "./ui/DashboardIconButton";
import {
  BlockFormModal,
  type BlockFormValues,
  type VillaOption,
} from "./BlockFormModal";

export type VillaBlockRow = {
  id: string;
  villaSlug: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  reason: string;
  createdAt: string | null;
};

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BlocksManager() {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/blocks", role) : false;

  const [blocks, setBlocks] = useState<VillaBlockRow[]>([]);
  const [villas, setVillas] = useState<VillaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [blocksRes, villasRes] = await Promise.all([
        dashboardFetch("/api/dashboard/blocks"),
        dashboardFetch("/api/dashboard/villas"),
      ]);
      if (!blocksRes.ok) {
        const d = (await blocksRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(d.error ?? "Failed to load blocks");
      }
      if (!villasRes.ok) {
        const d = (await villasRes.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(d.error ?? "Failed to load villas");
      }
      const blocksData = (await blocksRes.json()) as {
        blocks?: VillaBlockRow[];
      };
      const villasData = (await villasRes.json()) as {
        villas?: { slug: string; name: string }[];
      };
      setBlocks(blocksData.blocks ?? []);
      setVillas(
        (villasData.villas ?? []).map((v) => ({
          slug: v.slug,
          name: v.name,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createBlock = useCallback(
    async (values: BlockFormValues): Promise<string | null> => {
      const res = await dashboardFetch("/api/dashboard/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) return data.error ?? "Failed to create block";
      await load();
      return null;
    },
    [load],
  );

  const removeBlock = useCallback(
    async (row: VillaBlockRow) => {
      if (
        !window.confirm(
          `Release block for ${row.villaName} (${fmtDate(row.checkIn)} → ${fmtDate(row.checkOut)})?`,
        )
      ) {
        return;
      }
      setBusyId(row.id);
      setError(null);
      try {
        const res = await dashboardFetch(`/api/dashboard/blocks/${row.id}`, {
          method: "DELETE",
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Delete failed");
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Delete failed");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const columns: DataTableColumn<VillaBlockRow>[] = [
    {
      key: "villa",
      header: "Villa",
      cell: (row) => (
        <div>
          <p className="font-bold text-white">{row.villaName}</p>
          <p className="text-[length:var(--fs-desc)] text-[color:var(--dash-text-muted)]">
            {row.villaSlug}
          </p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      cell: (row) => (
        <span className="text-white/80">
          {fmtDate(row.checkIn)} → {fmtDate(row.checkOut)}
        </span>
      ),
    },
    {
      key: "nights",
      header: "Nights",
      cell: (row) => (
        <span className="text-white/60">
          {nightCount(row.checkIn, row.checkOut)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (row) => (
        <span className="text-[length:var(--fs-desc)] text-white/55">
          {row.reason || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => {
        if (!canWrite) return null;
        const busy = busyId === row.id;
        return (
          <DashboardIconButton
            label="Release block"
            variant="ghost"
            onClick={() => removeBlock(row)}
            disabled={busy}
            className="text-[color:var(--dash-text-secondary)] hover:text-red-400 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </DashboardIconButton>
        );
      },
    },
  ];

  return (
    <>
      <DashboardModuleFrame
        toolbar={
          <DashboardListToolbar
            meta={`${blocks.length} block${blocks.length === 1 ? "" : "s"}`}
            onRefresh={load}
            refreshing={loading}
          >
            {canWrite && villas.length > 0 && (
              <div className={`${dash.toolbarSegment} blocks-manager__add`}>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className={`${dash.btn} ${dash.btnAccent}`}
                >
                  <Plus className="h-4 w-4" />
                  New block
                </button>
              </div>
            )}
          </DashboardListToolbar>
        }
        error={error}
        loading={loading}
        loadingLabel="Loading blocks…"
      >
        {blocks.length === 0 ? (
          <EmptyState
            icon={<Blocks />}
            title="No manual blocks"
            description="Create a block to hold dates on the calendar without a guest booking. Blocks prevent new reservations on those nights."
            action={
              canWrite && villas.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className={`${dash.btn} ${dash.btnAccent}`}
                >
                  Create first block
                </button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={blocks}
            rowKey={(r) => r.id}
            caption="Manual villa blocks"
            stickyFirstColumn
            dense
          />
        )}
      </DashboardModuleFrame>

      {modalOpen && villas.length > 0 && (
        <BlockFormModal
          villas={villas}
          onClose={() => setModalOpen(false)}
          onSubmit={createBlock}
        />
      )}
    </>
  );
}
