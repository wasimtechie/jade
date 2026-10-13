"use client";

import { dash } from "@/lib/dashboard/dashboardClasses";
import type { AdminVillaDetail, AdminWeddingTier } from "@/lib/villas/adminVilla";
import { fieldLabel, QUICK_EDIT_SECTIONS } from "@/lib/villas/villaEditorLabels";
import {
  DashFloatingField,
  DashFloatingNumber,
  DashFloatingSelect,
  DashFloatingTextarea,
} from "@/components/dashboard/form";
import { ADD_ON_CATALOG } from "@/lib/bookings/addOnCatalog";

const ADD_ON_OPTIONS = Object.values(ADD_ON_CATALOG).map((a) => ({
  id: a.id,
  label: a.label,
}));

const WEDDING_MODE_OPTIONS = ["half_day", "full_day"] as const;

export type OperationalFieldProps = {
  id: string;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
};

type VillaOperationalFieldsProps = {
  villa: AdminVillaDetail;
  canWrite: boolean;
  fp: (key: string) => OperationalFieldProps;
  onPatch: (patch: Partial<AdminVillaDetail>) => void;
  onSetNum: (key: keyof AdminVillaDetail, value: string) => void;
  onUpdateTier: (tierId: string, patch: Partial<AdminWeddingTier>) => void;
  onToggleAddOn: (id: string) => void;
  showWedding?: boolean;
  showAddOns?: boolean;
};

export function VillaOperationalFields({
  villa,
  canWrite,
  fp,
  onPatch,
  onSetNum,
  onUpdateTier,
  onToggleAddOn,
  showWedding = true,
  showAddOns = true,
}: VillaOperationalFieldsProps) {
  return (
    <fieldset disabled={!canWrite} className={dash.stack}>
      <div className={dash.formGrid2}>
        <DashFloatingNumber
          label={fieldLabel("basePriceRupees").label}
          value={String(villa.basePriceRupees)}
          min={0}
          onChange={(v) => onSetNum("basePriceRupees", v)}
          {...fp("basePriceRupees")}
        />
        <DashFloatingNumber
          label={fieldLabel("dayOutBasePriceRupees").label}
          value={String(villa.dayOutBasePriceRupees)}
          min={0}
          onChange={(v) => onSetNum("dayOutBasePriceRupees", v)}
          {...fp("dayOutBasePriceRupees")}
        />
        <DashFloatingNumber
          label={fieldLabel("stayBasePax").label}
          value={String(villa.stayBasePax)}
          min={1}
          onChange={(v) => onSetNum("stayBasePax", v)}
          {...fp("stayBasePax")}
        />
        <DashFloatingNumber
          label={fieldLabel("dayOutBasePax").label}
          value={String(villa.dayOutBasePax)}
          min={1}
          onChange={(v) => onSetNum("dayOutBasePax", v)}
          {...fp("dayOutBasePax")}
        />
        <DashFloatingNumber
          label={fieldLabel("stayMaxPax").label}
          value={String(villa.stayMaxPax)}
          min={1}
          onChange={(v) => onSetNum("stayMaxPax", v)}
          {...fp("stayMaxPax")}
        />
        <DashFloatingNumber
          label={fieldLabel("extraPaxStayRupees").label}
          value={String(villa.extraPaxStayRupees)}
          min={0}
          onChange={(v) => onSetNum("extraPaxStayRupees", v)}
          {...fp("extraPaxStayRupees")}
        />
        <DashFloatingNumber
          label={fieldLabel("extraPaxDayOutRupees").label}
          value={String(villa.extraPaxDayOutRupees)}
          min={0}
          onChange={(v) => onSetNum("extraPaxDayOutRupees", v)}
          {...fp("extraPaxDayOutRupees")}
        />
      </div>

      <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
        {QUICK_EDIT_SECTIONS.policies.title}
      </p>
      <div className={dash.formGrid2}>
        <DashFloatingNumber
          label={fieldLabel("taxPercent").label}
          value={String(villa.taxPercent)}
          min={0}
          max={28}
          onChange={(v) => onSetNum("taxPercent", v)}
          {...fp("taxPercent")}
        />
        <DashFloatingNumber
          label="Deposit %"
          value={String(villa.depositPercent)}
          min={0}
          max={100}
          onChange={(v) => onSetNum("depositPercent", v)}
          {...fp("depositPercent")}
        />
        <DashFloatingNumber
          label="Fixed deposit (₹)"
          value={String(villa.depositPaiseRupees)}
          min={0}
          onChange={(v) => onSetNum("depositPaiseRupees", v)}
          {...fp("depositPaiseRupees")}
        />
        <DashFloatingNumber
          label="Cleaning fee (₹)"
          value={String(villa.cleaningFeeRupees)}
          min={0}
          onChange={(v) => onSetNum("cleaningFeeRupees", v)}
          {...fp("cleaningFeeRupees")}
        />
        <DashFloatingNumber
          label="Security deposit (₹)"
          value={String(villa.securityDepositRupees)}
          min={0}
          onChange={(v) => onSetNum("securityDepositRupees", v)}
          {...fp("securityDepositRupees")}
        />
        <DashFloatingField
          label={fieldLabel("checkInTime").label}
          value={villa.checkInTime}
          onChange={(checkInTime) => onPatch({ checkInTime })}
          {...fp("checkInTime")}
        />
        <DashFloatingField
          label={fieldLabel("checkOutTime").label}
          value={villa.checkOutTime}
          onChange={(checkOutTime) => onPatch({ checkOutTime })}
          {...fp("checkOutTime")}
        />
        <div className="sm:col-span-2">
          <DashFloatingTextarea
            label={fieldLabel("cancellationPolicy").label}
            value={villa.cancellationPolicy}
            rows={4}
            onChange={(cancellationPolicy) => onPatch({ cancellationPolicy })}
            {...fp("cancellationPolicy")}
          />
        </div>
      </div>

      {showWedding && villa.weddingVenue && villa.weddingTiers.length > 0 ? (
        <div className={dash.stack}>
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            {QUICK_EDIT_SECTIONS.wedding.title}
          </p>
          {villa.weddingTiers.map((tier, tierIndex) => (
            <div
              key={tier.id}
              className="border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="mb-3 font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
                {tier.id}
              </p>
              <div className={dash.formGrid2}>
                <DashFloatingField
                  className="sm:col-span-2"
                  label="Label"
                  value={tier.label}
                  onChange={(label) => onUpdateTier(tier.id, { label })}
                  {...fp(`weddingTiers.${tierIndex}.label`)}
                />
                <DashFloatingNumber
                  label="Price (₹)"
                  value={String(tier.priceRupees)}
                  min={0}
                  onChange={(v) =>
                    onUpdateTier(tier.id, { priceRupees: Number(v) })
                  }
                  {...fp(`weddingTiers.${tierIndex}.priceRupees`)}
                />
                <DashFloatingNumber
                  label="Max guests"
                  value={String(tier.maxGuests)}
                  min={1}
                  onChange={(v) =>
                    onUpdateTier(tier.id, { maxGuests: Number(v) })
                  }
                  {...fp(`weddingTiers.${tierIndex}.maxGuests`)}
                />
                <DashFloatingSelect
                  label="Mode"
                  value={tier.mode}
                  options={WEDDING_MODE_OPTIONS}
                  onChange={(mode) => onUpdateTier(tier.id, { mode })}
                  {...fp(`weddingTiers.${tierIndex}.mode`)}
                />
                <DashFloatingNumber
                  label="Stay included pax"
                  value={String(tier.stayIncludedPax)}
                  min={0}
                  onChange={(v) =>
                    onUpdateTier(tier.id, { stayIncludedPax: Number(v) })
                  }
                  {...fp(`weddingTiers.${tierIndex}.stayIncludedPax`)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showAddOns ? (
        <div className={dash.stack}>
          <p className="font-manrope text-xs font-bold uppercase tracking-widest text-white/40">
            {QUICK_EDIT_SECTIONS.addons.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {ADD_ON_OPTIONS.map((opt) => {
              const active = villa.addOnAvailability.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!canWrite}
                  onClick={() => onToggleAddOn(opt.id)}
                  className={`border px-3 py-2 font-manrope text-xs transition-colors ${
                    active
                      ? "border-[var(--dash-accent)] bg-[var(--dash-accent)]/15 text-[var(--dash-accent)]"
                      : "border-white/15 text-white/55 hover:border-white/30"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
