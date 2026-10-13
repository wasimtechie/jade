"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Download, Globe, Loader2 } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./ui/DashboardListToolbar";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";
import { DashboardPanel } from "./DashboardPanel";
import {
  CHANNEL_STATE_LABELS,
  type VillaChannelState,
} from "@/lib/axisRooms/channelState";

type VillaMapping = {
  slug: string;
  name: string;
  channelState: VillaChannelState;
  axisPropertyId: string;
  axisRoomTypeId: string;
  axisRatePlanId: string;
};

type ConnectedOta = {
  channelId: number;
  channelName: string;
};

type SyncLogEntry = {
  id: string;
  action: string;
  targetId: string | null;
  createdAt: string | null;
  metadata: Record<string, unknown>;
};

export function AxisRoomsSettings() {
  const [rows, setRows] = useState<VillaMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"set" | "missing">("missing");
  const [axisMeta, setAxisMeta] = useState<{
    pmsName?: string;
    baseUrl?: string;
    inboundWebhookPath?: string;
    configured?: boolean;
    enabled?: boolean;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [otas, setOtas] = useState<ConnectedOta[]>([]);
  const [otasLoading, setOtasLoading] = useState(false);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>([]);
  const [syncLogLoading, setSyncLogLoading] = useState(false);
  const [verifySlug, setVerifySlug] = useState("");
  const [verifyOtaId, setVerifyOtaId] = useState("");
  const [verifyStart, setVerifyStart] = useState("");
  const [verifyEnd, setVerifyEnd] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [channelSlug, setChannelSlug] = useState("");
  const [channelOtaIds, setChannelOtaIds] = useState("");
  const [channelStart, setChannelStart] = useState("");
  const [channelEnd, setChannelEnd] = useState("");
  const [channelBusy, setChannelBusy] = useState(false);
  const [channelMsg, setChannelMsg] = useState<string | null>(null);

  const inboundWebhookUrl = useMemo(() => {
    const path = axisMeta?.inboundWebhookPath ?? "/api/webhooks/axisrooms";
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  }, [axisMeta?.inboundWebhookPath]);

  const liveVillas = useMemo(
    () => rows.filter((r) => r.channelState === "live"),
    [rows],
  );

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(inboundWebhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy URL");
    }
  };

  const unmappedCount = useMemo(
    () =>
      rows.filter(
        (r) => !r.axisPropertyId || !r.axisRoomTypeId || !r.axisRatePlanId,
      ).length,
    [rows],
  );

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await dashboardFetch("/api/dashboard/settings/axis-rooms/csv");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jade-axisrooms-properties.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const loadConnectedOtas = useCallback(async () => {
    setOtasLoading(true);
    try {
      const res = await dashboardFetch(
        "/api/dashboard/settings/axis-rooms/connected-otas",
      );
      if (!res.ok) return;
      const data = (await res.json()) as { otas?: ConnectedOta[] };
      setOtas(data.otas ?? []);
    } finally {
      setOtasLoading(false);
    }
  }, []);

  const loadSyncLog = useCallback(async () => {
    setSyncLogLoading(true);
    try {
      const res = await dashboardFetch(
        "/api/dashboard/settings/axis-rooms/log?limit=40",
      );
      if (!res.ok) return;
      const data = (await res.json()) as { entries?: SyncLogEntry[] };
      setSyncLog(data.entries ?? []);
    } finally {
      setSyncLogLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [villasRes, sysRes] = await Promise.all([
        dashboardFetch("/api/dashboard/villas?all=1"),
        dashboardFetch("/api/dashboard/dev/system"),
      ]);
      if (!villasRes.ok) throw new Error("Failed to load villas");
      const villasData = (await villasRes.json()) as {
        villas?: {
          slug: string;
          name: string;
          channelState?: VillaChannelState;
        }[];
      };
      if (sysRes.ok) {
        const sys = (await sysRes.json()) as {
          secrets?: { AXIS_ROOMS_API_KEY?: string };
          axisRooms?: {
            pmsName?: string;
            baseUrl?: string;
            inboundWebhookPath?: string;
            configured?: boolean;
            enabled?: boolean;
          };
        };
        setApiStatus(
          (sys.secrets?.AXIS_ROOMS_API_KEY ?? "missing") as "set" | "missing",
        );
        setAxisMeta(sys.axisRooms ?? null);
      }

      const detailRows: VillaMapping[] = [];
      for (const v of villasData.villas ?? []) {
        const d = await dashboardFetch(`/api/dashboard/villas/${v.slug}`);
        if (!d.ok) continue;
        const full = (await d.json()) as {
          villa?: {
            channelState?: VillaChannelState;
            axisRooms?: {
              propertyId?: string;
              roomTypeId?: string;
              ratePlanId?: string;
            };
          };
        };
        const axis = full.villa?.axisRooms ?? {};
        detailRows.push({
          slug: v.slug,
          name: v.name,
          channelState: full.villa?.channelState ?? v.channelState ?? "website_only",
          axisPropertyId: axis.propertyId ?? "",
          axisRoomTypeId: axis.roomTypeId ?? "",
          axisRatePlanId: axis.ratePlanId ?? "",
        });
      }
      setRows(detailRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (rows.length > 0) {
      setVerifySlug((prev) => prev || rows[0]!.slug);
      setChannelSlug((prev) => prev || rows[0]!.slug);
    }
  }, [rows]);

  useEffect(() => {
    void load();
    void loadConnectedOtas();
    void loadSyncLog();
  }, [load, loadConnectedOtas, loadSyncLog]);

  const runVerify = async () => {
    setVerifyBusy(true);
    setVerifyResult(null);
    try {
      const res = await dashboardFetch("/api/dashboard/settings/axis-rooms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaSlug: verifySlug,
          otaId: Number(verifyOtaId),
          startDate: verifyStart,
          endDate: verifyEnd,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        availability?: { date: string; free: number }[];
        rates?: { date: string; price: Record<string, number> }[];
      };
      if (!res.ok) throw new Error(data.error ?? "Verify failed");
      setVerifyResult(
        `Availability: ${data.availability?.length ?? 0} days · Rates: ${data.rates?.length ?? 0} days`,
      );
    } catch (e) {
      setVerifyResult(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setVerifyBusy(false);
    }
  };

  const runChannelControl = async (action: "pause" | "resume") => {
    setChannelBusy(true);
    setChannelMsg(null);
    try {
      const otaIds = channelOtaIds
        .split(/[,;\s]+/)
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
      const res = await dashboardFetch(
        "/api/dashboard/settings/axis-rooms/channel-control",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            villaSlug: channelSlug,
            action,
            otaIds,
            startDate: channelStart,
            endDate: channelEnd,
          }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Channel control failed");
      setChannelMsg(action === "pause" ? "Paused on selected OTAs" : "Resumed on selected OTAs");
      void loadSyncLog();
    } catch (e) {
      setChannelMsg(e instanceof Error ? e.message : "Channel control failed");
    } finally {
      setChannelBusy(false);
    }
  };

  const columns: DataTableColumn<VillaMapping>[] = [
    {
      key: "villa",
      header: "Property",
      cell: (r) => (
        <div>
          <p className="font-bold text-white">{r.name}</p>
          <p className="font-mono text-xs text-white/40">{r.slug}</p>
          <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-white/45">
            {r.channelState === "live" && axisMeta?.enabled === false ? "Mapped — paused" : CHANNEL_STATE_LABELS[r.channelState]}
          </p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property ID",
      cell: (r) => (
        <span className="font-mono text-xs text-white/60">
          {r.axisPropertyId || "—"}
        </span>
      ),
    },
    {
      key: "room",
      header: "Room type",
      cell: (r) => (
        <span className="font-mono text-xs text-white/60">
          {r.axisRoomTypeId || "—"}
        </span>
      ),
    },
    {
      key: "rate",
      header: "Rate plan",
      cell: (r) => (
        <span className="font-mono text-xs text-white/60">
          {r.axisRatePlanId || "—"}
        </span>
      ),
    },
    {
      key: "edit",
      header: "",
      cell: (r) => (
        <Link
          href={`/dashboard/settings/villas?edit=${encodeURIComponent(r.slug)}`}
          className="font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)] hover:underline"
        >
          Edit mapping
        </Link>
      ),
    },
  ];

  return (
    <DashboardModuleFrame
      toolbar={
        <DashboardListToolbar
          meta={
            <span className="inline-flex items-center gap-2">
              <Globe className="h-4 w-4 text-[var(--dash-accent)]" />
              <span className="dashboard-toolbar__meta--hide-sm">
                Axis Rooms API key:{" "}
                <span
                  className={
                    axisMeta?.enabled !== false && apiStatus === "set" ? "text-emerald-300" : "text-amber-300"
                  }
                >
                  {axisMeta?.enabled === false ? "Paused — credentials pending" : apiStatus === "set" ? "Configured" : "Awaiting credentials"}
                </span>
                {unmappedCount > 0 && (
                  <>
                    {" "}
                    · {unmappedCount} villa{unmappedCount === 1 ? "" : "s"} need
                    Axis IDs
                  </>
                )}
                {liveVillas.length > 0 && (
                  <>
                    {" "}
                    · {liveVillas.length} mapped properties
                  </>
                )}
              </span>
            </span>
          }
          onRefresh={() => {
            void load();
            void loadConnectedOtas();
            void loadSyncLog();
          }}
          refreshing={loading || otasLoading || syncLogLoading}
        >
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting || loading}
            className={`${dash.btn} ${dash.btnGhost}`}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </DashboardListToolbar>
      }
      error={error}
      loading={loading}
      loadingLabel="Loading mappings…"
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            Axis Rooms integration
          </p>
          <ul className="mt-3 space-y-2 font-manrope text-sm text-white/70">
            <li>
              <span className="text-white/45">PMS name (tell Axis):</span>{" "}
              <strong className="text-white">
                {axisMeta?.pmsName ?? "Jade Host PMS"}
              </strong>
            </li>
            <li>
              <span className="text-white/45">Base URL:</span>{" "}
              <code className="text-xs text-[var(--dash-accent)]">
                {axisMeta?.baseUrl ?? "https://sandbox2.axisrooms.com"}
              </code>
            </li>
            <li>
              <span className="text-white/45">APIs wired:</span> 1, 2, 6, 7, 9,
              12, 13, 15 · 3, 4, 5, 8
            </li>
          </ul>
        </div>
        <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            API 9 — inbound booking URL
          </p>
          <p className="mt-2 font-manrope text-xs leading-relaxed text-white/55">
            Share this with Axis Rooms after outbound API testing passes.
          </p>
          <div className="mt-3 flex items-start gap-2">
            <code className="flex-1 break-all rounded-sm bg-black/40 px-2 py-2 text-xs text-emerald-200/90">
              {inboundWebhookUrl}
            </code>
            <button
              type="button"
              onClick={copyWebhook}
              className={`${dash.btn} ${dash.btnGhost} shrink-0`}
              aria-label="Copy webhook URL"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <DashboardPanel pad>
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            Connected OTAs (API 13)
          </p>
          {otasLoading ? (
            <p className="mt-3 text-sm text-white/50">Loading…</p>
          ) : otas.length === 0 ? (
            <p className="mt-3 text-sm text-white/50">
              No OTAs returned — confirm production credentials and Axis mappings.
            </p>
          ) : (
            <ul className="mt-3 space-y-1 font-manrope text-sm text-white/70">
              {otas.map((o) => (
                <li key={o.channelId}>
                  <span className="font-mono text-[var(--dash-accent)]">
                    {o.channelId}
                  </span>{" "}
                  — {o.channelName}
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        <DashboardPanel pad>
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            Verify on OTA (APIs 5 & 8)
          </p>
          <div className="mt-3 grid gap-2">
            <select
              value={verifySlug}
              onChange={(e) => setVerifySlug(e.target.value)}
              className={dash.inputCompact}
            >
              {rows.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="OTA id (from list)"
              value={verifyOtaId}
              onChange={(e) => setVerifyOtaId(e.target.value)}
              className={dash.inputCompact}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={verifyStart}
                onChange={(e) => setVerifyStart(e.target.value)}
                className={dash.inputCompact}
              />
              <input
                type="date"
                value={verifyEnd}
                onChange={(e) => setVerifyEnd(e.target.value)}
                className={dash.inputCompact}
              />
            </div>
            <button
              type="button"
              onClick={() => void runVerify()}
              disabled={verifyBusy || !verifySlug || !verifyOtaId}
              className={`${dash.btn} ${dash.btnAccent} ${dash.btnDense}`}
            >
              {verifyBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify
            </button>
            {verifyResult ? (
              <p className="text-xs text-white/60">{verifyResult}</p>
            ) : null}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel pad className="mb-6">
        <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
          Per-OTA pause / resume (APIs 3 & 4)
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <select
            value={channelSlug}
            onChange={(e) => setChannelSlug(e.target.value)}
            className={dash.inputCompact}
          >
            {liveVillas.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            placeholder="OTA ids (comma-separated)"
            value={channelOtaIds}
            onChange={(e) => setChannelOtaIds(e.target.value)}
            className={dash.inputCompact}
          />
          <input
            type="date"
            value={channelStart}
            onChange={(e) => setChannelStart(e.target.value)}
            className={dash.inputCompact}
          />
          <input
            type="date"
            value={channelEnd}
            onChange={(e) => setChannelEnd(e.target.value)}
            className={dash.inputCompact}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={channelBusy || liveVillas.length === 0 || axisMeta?.enabled === false}
            onClick={() => void runChannelControl("pause")}
            className={`${dash.btn} ${dash.btnGhost} ${dash.btnDense}`}
          >
            Pause on OTAs
          </button>
          <button
            type="button"
            disabled={channelBusy || liveVillas.length === 0 || axisMeta?.enabled === false}
            onClick={() => void runChannelControl("resume")}
            className={`${dash.btn} ${dash.btnGhost} ${dash.btnDense}`}
          >
            Resume on OTAs
          </button>
          {channelMsg ? (
            <span className="self-center text-xs text-white/60">{channelMsg}</span>
          ) : null}
        </div>
      </DashboardPanel>

      <DashboardPanel pad className="mb-6">
        <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
          Axis sync log
        </p>
        {syncLogLoading ? (
          <p className="mt-3 text-sm text-white/50">Loading…</p>
        ) : syncLog.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">
            No sync events yet — inventory/price pushes and inbound bookings appear here.
          </p>
        ) : (
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto font-mono text-xs text-white/65">
            {syncLog.map((e) => (
              <li key={e.id} className="border-b border-white/5 pb-2">
                <span className="text-[var(--dash-accent)]">{e.action}</span>
                {e.targetId ? ` · ${e.targetId}` : ""}
                {e.createdAt ? (
                  <span className="text-white/35">
                    {" "}
                    · {new Date(e.createdAt).toLocaleString("en-IN")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.slug}
        emptyMessage="No villas in portfolio."
        caption="Axis Rooms property mapping"
        stickyFirstColumn
        dense
      />
    </DashboardModuleFrame>
  );
}
