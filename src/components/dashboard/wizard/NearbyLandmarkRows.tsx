"use client";

import {
  wizardHintClass,
  wizardInputClass,
  wizardLabelClass,
  wizardSectionClass,
} from "./wizardFieldStyles";

export type NearbyDraft = {
  label: string;
  distance: string;
  note: string;
};

type NearbyLandmarkRowsProps = {
  rows: NearbyDraft[];
  onChange: (rows: NearbyDraft[]) => void;
  disabled?: boolean;
};

export function NearbyLandmarkRows({
  rows,
  onChange,
  disabled,
}: NearbyLandmarkRowsProps) {
  const update = (index: number, patch: Partial<NearbyDraft>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className={wizardHintClass}>
        Shown in the Location section — landmark name, travel time, and a short
        note (highway, area, etc.).
      </p>
      {rows.map((row, i) => (
        <div key={i} className={`${wizardSectionClass} grid gap-3 sm:grid-cols-3`}>
          <div>
            <label className={wizardLabelClass}>Landmark</label>
            <input
              className={wizardInputClass}
              placeholder="Art of Living"
              value={row.label}
              disabled={disabled}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </div>
          <div>
            <label className={wizardLabelClass}>Distance / time</label>
            <input
              className={wizardInputClass}
              placeholder="10 min"
              value={row.distance}
              disabled={disabled}
              onChange={(e) => update(i, { distance: e.target.value })}
            />
          </div>
          <div>
            <label className={wizardLabelClass}>Note</label>
            <input
              className={wizardInputClass}
              placeholder="via Kanakapura Road"
              value={row.note}
              disabled={disabled}
              onChange={(e) => update(i, { note: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        className="font-manrope text-sm text-[var(--dash-accent)] hover:underline disabled:opacity-50"
        onClick={() =>
          onChange([...rows, { label: "", distance: "", note: "" }])
        }
      >
        + Add nearby landmark
      </button>
    </div>
  );
}

export function nearbyDraftFromStored(
  items: Array<{ label: string; distance: string; note?: string }> | undefined,
): NearbyDraft[] {
  if (!items?.length) return [{ label: "", distance: "", note: "" }];
  return items.map((n) => ({
    label: n.label ?? "",
    distance: n.distance ?? "",
    note: n.note ?? "",
  }));
}

export function nearbyDraftToPayload(rows: NearbyDraft[]) {
  return rows
    .filter((r) => r.label.trim())
    .map((r) => ({
      label: r.label.trim(),
      distance: r.distance.trim(),
      note: r.note.trim() || undefined,
    }));
}
