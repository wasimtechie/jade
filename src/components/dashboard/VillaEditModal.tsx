"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { useDashboardForm } from "@/lib/dashboard/dashboardFormValidation";
import { DashboardModalHeader } from "./ui/DashboardModalHeader";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { VillaOperationalFields } from "./villa/VillaOperationalFields";
import { VillaDeletePanel } from "./villa/VillaDeletePanel";
import type { AdminVillaDetail, AdminWeddingTier } from "@/lib/villas/adminVilla";
import { villaHideFromDirectoryFlag } from "@/lib/villas/villaVisibility";
import { validateQuickEdit } from "@/lib/villas/villaEditorValidation";
import { QUICK_EDIT_SECTIONS, fieldLabel } from "@/lib/villas/villaEditorLabels";
import { ImageUploadField } from "./ImageUploadField";
import {
  DashFormShell,
  DashFormActionBar,
  DashSectionCard,
  DashFloatingField,
  DashFloatingTextarea,
  DashFloatingSelect,
  DashToggle,
  DashFormNotice,
} from "@/components/dashboard/form";

const hintClass = "villa-form-field__hint";

const STATUS_OPTIONS = ["active", "maintenance", "hidden"] as const;

const DISPLAY_STAT_KEYS = [
  ["stay", "Stay capacity"],
  ["events", "Event capacity"],
  ["bhk", "Bedrooms / layout"],
  ["lawn", "Lawn / outdoor"],
  ["villaArea", "Built-up / estate"],
  ["pool", "Pool (if any)"],
] as const;

type VillaEditModalProps = {
  slug: string;
  canWrite: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  onOpenFullEditor?: () => void;
};

export function VillaEditModal({
  slug,
  canWrite,
  onClose,
  onSaved,
  onDeleted,
  onOpenFullEditor,
}: VillaEditModalProps) {
  const [villa, setVilla] = useState<AdminVillaDetail | null>(null);
  const [deletion, setDeletion] = useState<{
    allowed: boolean;
    reason?: string;
  } | null>(null);
  const [baselineJson, setBaselineJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useDashboardForm<AdminVillaDetail>({
    validate: (values) => validateQuickEdit(values),
  });

  const dirty = useMemo(() => {
    if (!villa || !baselineJson) return false;
    return JSON.stringify(villa) !== baselineJson;
  }, [villa, baselineJson]);

  const fp = (key: string) => ({
    id: key,
    invalid: Boolean(form.fieldErrors[key]),
    showError: form.showFieldError(key),
    errorMessage: form.fieldErrors[key],
    onBlur: () => form.touch(key),
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      form.resetValidation();
      try {
        const res = await dashboardFetch(`/api/dashboard/villas/${slug}`);
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(d.error ?? "Failed to load villa");
        }
        const data = (await res.json()) as {
          villa: AdminVillaDetail;
          deletion?: { allowed: boolean; reason?: string };
        };
        if (!cancelled) {
          setVilla(data.villa);
          setDeletion(data.deletion ?? { allowed: false });
          setBaselineJson(JSON.stringify(data.villa));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load villa");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when slug changes only
  }, [slug]);

  const patchVilla = (patch: Partial<AdminVillaDetail>) => {
    if (!villa) return;
    const next = { ...villa, ...patch };
    setVilla(next);
    for (const key of Object.keys(patch)) {
      form.validateField(key, next);
    }
  };

  const setNum = (key: keyof AdminVillaDetail, value: string) => {
    if (!villa) return;
    const next = { ...villa, [key]: Number(value) };
    setVilla(next);
    form.validateField(String(key), next);
  };

  const setStat = (key: string, value: string) => {
    if (!villa) return;
    const next = {
      ...villa,
      displayStats: { ...villa.displayStats, [key]: value },
    };
    setVilla(next);
    form.validateField(`displayStats.${key}`, next);
  };

  const updateTier = (tierId: string, patch: Partial<AdminWeddingTier>) => {
    if (!villa) return;
    const tierIndex = villa.weddingTiers.findIndex((t) => t.id === tierId);
    const next = {
      ...villa,
      weddingTiers: villa.weddingTiers.map((t) =>
        t.id === tierId ? { ...t, ...patch } : t,
      ),
    };
    setVilla(next);
    if (tierIndex >= 0) {
      for (const key of Object.keys(patch)) {
        form.validateField(`weddingTiers.${tierIndex}.${key}`, next);
      }
    }
  };

  const toggleAddOn = (id: string) => {
    if (!villa) return;
    const has = villa.addOnAvailability.includes(id);
    const next = {
      ...villa,
      addOnAvailability: has
        ? villa.addOnAvailability.filter((x) => x !== id)
        : [...villa.addOnAvailability, id],
    };
    setVilla(next);
    form.validateField("addOnAvailability", next);
  };

  const patchAxisRooms = (
    key: "propertyId" | "roomTypeId" | "ratePlanId" | "ratePlanName",
    value: string,
  ) => {
    if (!villa) return;
    const axis = villa.axisRooms ?? {
      propertyId: "",
      roomTypeId: "",
      ratePlanId: "",
      ratePlanName: "",
    };
    const next = {
      ...villa,
      axisRooms: { ...axis, [key]: value },
    };
    setVilla(next);
    form.validateField(`axisRooms.${key}`, next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!villa || !canWrite) return;
    if (!form.runSubmit(villa)) return;

    setSaving(true);
    setError(null);
    try {
      const publishOnDirectory =
        villa.status === "active" || villa.status === "maintenance";
      const res = await dashboardFetch(`/api/dashboard/villas/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: villa.name,
          shortName: villa.shortName,
          type: villa.type,
          location: villa.location,
          thumbnail: villa.thumbnail,
          basePriceRupees: villa.basePriceRupees,
          dayOutBasePriceRupees: villa.dayOutBasePriceRupees,
          stayBasePax: villa.stayBasePax,
          dayOutBasePax: villa.dayOutBasePax,
          stayMaxPax: villa.stayMaxPax,
          extraPaxStayRupees: villa.extraPaxStayRupees,
          extraPaxDayOutRupees: villa.extraPaxDayOutRupees,
          taxPercent: villa.taxPercent,
          cleaningFeeRupees: villa.cleaningFeeRupees,
          securityDepositRupees: villa.securityDepositRupees,
          depositPaiseRupees: villa.depositPaiseRupees,
          checkInTime: villa.checkInTime,
          checkOutTime: villa.checkOutTime,
          cancellationPolicy: villa.cancellationPolicy,
          depositPercent: villa.depositPercent,
          status: villa.status,
          bookable: villa.bookable,
          weddingVenue: villa.weddingVenue,
          weddingTiers: villa.weddingTiers.map((t) => ({
            id: t.id,
            label: t.label,
            mode: t.mode,
            maxGuests: t.maxGuests,
            priceRupees: t.priceRupees,
            stayIncludedPax: t.stayIncludedPax,
          })),
          addOnAvailability: villa.addOnAvailability,
          displayStats: villa.displayStats,
          notes: villa.notes,
          channelMode: villa.channelMode,
          axisRooms: villa.axisRooms,
          ...(publishOnDirectory
            ? { content: { hideFromVillasDirectory: false } }
            : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!res.ok) {
        if (res.status === 400 && data.fieldErrors) {
          form.applyApiFieldErrors(data.fieldErrors);
        }
        throw new Error(data.error ?? "Save failed");
      }
      setBaselineJson(JSON.stringify(villa));
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const axis = villa?.axisRooms ?? {
    propertyId: "",
    roomTypeId: "",
    ratePlanId: "",
    ratePlanName: "",
  };

  return (
    <div className={`${dash.modalOverlay} justify-end overflow-hidden p-0`}>
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close panel"
        onClick={onClose}
      />

      <div
        className={`${GLASS_CHROME_FRAME_CLASS} relative z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl min-h-0 flex-col border-l border-white/10 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-px block ${GLASS_INNER_SURFACE}`}
        />

        <DashboardModalHeader
          section={`Villa settings${!canWrite ? " · read-only" : ""}`}
          title={villa?.shortName ?? villa?.name ?? slug}
          description={`${slug}${villa?.retreatId ? ` · ${villa.retreatId}` : ""}`}
          onClose={onClose}
          actions={
            villa?.thumbnail ? (
              <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden border border-white/15 sm:block">
                <Image
                  src={villa.thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ) : undefined
          }
        />

        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--dash-accent)]" />
            </div>
          ) : !villa ? (
            <p className="p-5 text-red-400">{error ?? "Villa not found"}</p>
          ) : (
            <form
              id="villa-edit-form"
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <fieldset disabled={!canWrite} className="contents">
                <DashFormShell drawer>
                  <DashSectionCard
                    title={QUICK_EDIT_SECTIONS.identity.title}
                    description="How this property appears on /retreats/ and in the dashboard."
                    badge={QUICK_EDIT_SECTIONS.identity.badge}
                  >
                    <div className={dash.formGrid2}>
                      <DashFloatingField
                        className="sm:col-span-2"
                        label={fieldLabel("name").label}
                        value={villa.name}
                        required
                        onChange={(name) => patchVilla({ name })}
                        {...fp("name")}
                      />
                      <DashFloatingField
                        label={fieldLabel("shortName").label}
                        value={villa.shortName}
                        onChange={(shortName) => patchVilla({ shortName })}
                        {...fp("shortName")}
                      />
                      <DashFloatingField
                        label={fieldLabel("type").label}
                        value={villa.type}
                        onChange={(type) => patchVilla({ type })}
                        {...fp("type")}
                      />
                      <DashFloatingField
                        className="sm:col-span-2"
                        label={fieldLabel("location").label}
                        value={villa.location}
                        onChange={(location) => patchVilla({ location })}
                        {...fp("location")}
                      />
                      <div className="sm:col-span-2" data-field="thumbnail">
                        <ImageUploadField
                          label={fieldLabel("thumbnail").label}
                          hint={fieldLabel("thumbnail").hint}
                          value={villa.thumbnail}
                          onChange={(url) => {
                            patchVilla({ thumbnail: url });
                            form.touch("thumbnail");
                          }}
                          villaSlug={slug}
                          disabled={!canWrite}
                        />
                        {form.showFieldError("thumbnail") && form.fieldErrors.thumbnail ? (
                          <p className={dash.fieldError}>{form.fieldErrors.thumbnail}</p>
                        ) : null}
                      </div>
                      {onOpenFullEditor && canWrite ? (
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={onOpenFullEditor}
                            className="villa-form-full-editor-cta"
                          >
                            <span className="villa-form-full-editor-cta__title">
                              Open full property editor
                            </span>
                            <span className="villa-form-full-editor-cta__desc">
                              Amenities, spaces, experiences, video, FAQ & brochure
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </DashSectionCard>

                  <DashSectionCard
                    title={QUICK_EDIT_SECTIONS.pricing.title}
                    description="Rates, policies, wedding tiers, and add-ons — same fields as Full Editor step 13."
                    badge={QUICK_EDIT_SECTIONS.pricing.badge}
                  >
                    <VillaOperationalFields
                      villa={villa}
                      canWrite={canWrite}
                      fp={fp}
                      onPatch={patchVilla}
                      onSetNum={setNum}
                      onUpdateTier={updateTier}
                      onToggleAddOn={toggleAddOn}
                    />
                  </DashSectionCard>

                  <DashSectionCard
                    title={QUICK_EDIT_SECTIONS.visibility.title}
                    description="Control whether guests see this villa on the website and can book online."
                    badge={QUICK_EDIT_SECTIONS.visibility.badge}
                  >
                    {villa.status !== "hidden" && villaHideFromDirectoryFlag(villa) ? (
                      <DashFormNotice variant="warning">
                        This villa is <strong>not listed on /retreats/</strong> yet. Set
                        visibility to <strong>Live</strong> and save — it will appear on
                        the public directory automatically.
                      </DashFormNotice>
                    ) : null}
                    <div className={dash.stack}>
                      <DashFloatingSelect
                        label="Public visibility"
                        value={villa.status}
                        options={STATUS_OPTIONS}
                        onChange={(status) => {
                          patchVilla({
                            status,
                            ...(status === "hidden" ? { bookable: false } : {}),
                            ...(status === "active" || status === "maintenance"
                              ? {
                                  content: {
                                    ...villa.content,
                                    hideFromVillasDirectory: false,
                                  },
                                }
                              : {}),
                          });
                        }}
                        {...fp("status")}
                      />
                      <DashToggle
                        label="Allow online booking"
                        description="Guests see Book Villa. When off, they see Enquire + View Villa only."
                        checked={villa.bookable}
                        disabled={villa.status === "hidden"}
                        onChange={(bookable) => patchVilla({ bookable })}
                      />
                      <DashToggle
                        label="Wedding / event venue"
                        description="Shows the Wedding badge in Villa Settings and wedding filters."
                        checked={villa.weddingVenue}
                        onChange={(weddingVenue) => patchVilla({ weddingVenue })}
                      />
                    </div>
                  </DashSectionCard>

                  <DashSectionCard
                    title={QUICK_EDIT_SECTIONS.stats.title}
                    description="Shown on villa directory cards (/retreats/)."
                    badge={QUICK_EDIT_SECTIONS.stats.badge}
                  >
                    <div className={dash.formGrid2}>
                      {DISPLAY_STAT_KEYS.map(([key, label]) => (
                        <DashFloatingField
                          key={key}
                          label={label}
                          value={villa.displayStats[key] ?? ""}
                          onChange={(v) => setStat(key, v)}
                          {...fp(`displayStats.${key}`)}
                        />
                      ))}
                    </div>
                  </DashSectionCard>

                  <DashSectionCard
                    title="Axis Rooms"
                    description="Channel manager mapping — OTA sync only when mode is channel-managed and IDs are set."
                  >
                    <div className={dash.formGrid2}>
                      <DashFloatingSelect
                        id="channelMode"
                        label="Channel mode"
                        value={villa.channelMode ?? "website_only"}
                        onChange={(v) =>
                          patchVilla({
                            channelMode: v as "website_only" | "channel_managed",
                          })
                        }
                        optionItems={[
                          { value: "website_only", label: "Website only (no OTA sync)" },
                          {
                            value: "channel_managed",
                            label: "Channel managed (sync to OTAs)",
                          },
                        ]}
                        disabled={!canWrite}
                      />
                      <DashFloatingField
                        label="Property ID"
                        value={axis.propertyId}
                        onChange={(v) => patchAxisRooms("propertyId", v)}
                        {...fp("axisRooms.propertyId")}
                      />
                      <DashFloatingField
                        label="Room type ID"
                        value={axis.roomTypeId}
                        onChange={(v) => patchAxisRooms("roomTypeId", v)}
                        {...fp("axisRooms.roomTypeId")}
                      />
                      <DashFloatingField
                        label="Rate plan ID"
                        value={axis.ratePlanId}
                        onChange={(v) => patchAxisRooms("ratePlanId", v)}
                        {...fp("axisRooms.ratePlanId")}
                      />
                      <DashFloatingField
                        label="Rate plan name"
                        value={axis.ratePlanName}
                        onChange={(v) => patchAxisRooms("ratePlanName", v)}
                        {...fp("axisRooms.ratePlanName")}
                      />
                    </div>
                  </DashSectionCard>

                  <DashSectionCard
                    title="Internal notes"
                    description="Staff-only — not shown on the public site."
                  >
                    <DashFloatingTextarea
                      label="Notes"
                      value={villa.notes}
                      rows={5}
                      onChange={(notes) => patchVilla({ notes })}
                      {...fp("notes")}
                    />
                    {villa.updatedAt ? (
                      <p className={hintClass}>
                        Last saved {new Date(villa.updatedAt).toLocaleString("en-IN")}
                      </p>
                    ) : null}
                  </DashSectionCard>

                  {canWrite && deletion ? (
                    <VillaDeletePanel
                      slug={villa.slug}
                      name={villa.name}
                      shortName={villa.shortName}
                      allowed={deletion.allowed}
                      blockedReason={deletion.reason}
                      onDeleted={() => {
                        onDeleted?.();
                        onClose();
                      }}
                    />
                  ) : null}
                </DashFormShell>
              </fieldset>

              {error ? (
                <p className="px-5 pb-2 font-manrope text-red-400">{error}</p>
              ) : null}

              {canWrite ? (
                <DashFormActionBar dirty={dirty}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`${dash.btn} ${dash.btnText} flex-1`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`${dash.btn} ${dash.btnAccent} flex-[2] disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    {saving ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      "Save all changes"
                    )}
                  </button>
                </DashFormActionBar>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
