"use client";

import { getVillaDetailIcon } from "@/lib/villaDetailIcons";
import { VillaIconPicker } from "@/components/dashboard/villa/VillaIconPicker";
import {
  wizardHintClass,
  wizardInputClass,
  wizardLabelClass,
  wizardSectionClass,
} from "./wizardFieldStyles";

export type AmenityDraft = {
  label: string;
  icon: string;
  description: string;
};

type AmenityEditorRowsProps = {
  rows: AmenityDraft[];
  onChange: (rows: AmenityDraft[]) => void;
  disabled?: boolean;
};

export function AmenityEditorRows({
  rows,
  onChange,
  disabled,
}: AmenityEditorRowsProps) {
  const update = (index: number, patch: Partial<AmenityDraft>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className={wizardHintClass}>
        Matches the intro scroll grid and Amenities section on the villa detail
        page. The first 8 items power the hero highlight tiles.
      </p>
      {rows.map((row, i) => {
        const Icon = getVillaDetailIcon(row.icon, row.label);
        return (
          <div key={i} className={wizardSectionClass}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--dash-accent-border)] bg-black/30">
                <Icon className="h-7 w-7 text-[var(--dash-accent)]" strokeWidth={1.25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-manrope text-xs uppercase tracking-widest text-white/40">
                  Preview tile {i + 1}
                </p>
                <p className="truncate font-philosopher text-lg text-white">
                  {row.label || "Amenity label"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={wizardLabelClass}>Label</label>
                <input
                  className={wizardInputClass}
                  placeholder="Private Pool"
                  value={row.label}
                  disabled={disabled}
                  onChange={(e) => update(i, { label: e.target.value })}
                />
              </div>
              <VillaIconPicker
                id={`amenity-icon-${i}`}
                label="Icon"
                value={row.icon}
                disabled={disabled}
                onChange={(icon) => update(i, { icon })}
              />
              <div>
                <label className={wizardLabelClass}>Detail blurb (optional)</label>
                <input
                  className={wizardInputClass}
                  placeholder="Shown in amenities drawer"
                  value={row.description}
                  disabled={disabled}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled}
        className="font-manrope text-sm text-[var(--dash-accent)] hover:underline disabled:opacity-50"
        onClick={() =>
          onChange([...rows, { label: "", icon: "Sparkles", description: "" }])
        }
      >
        + Add amenity
      </button>
    </div>
  );
}
