"use client";

import { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Search } from "lucide-react";
import {
  ICON_CATEGORIES,
  searchIcons,
  type IconCategory,
  type VillaIconOption,
} from "@/lib/villas/amenityIconOptions";
import { dash } from "@/lib/dashboard/dashboardClasses";

function resolveLucideIcon(name: string): LucideIcon | null {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[
    name
  ];
  return Icon ?? null;
}

type VillaIconPickerProps = {
  id: string;
  label: string;
  value: string;
  onChange: (iconName: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  showError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
};

export function VillaIconPicker({
  id,
  label,
  value,
  onChange,
  onBlur,
  invalid,
  showError,
  errorMessage,
  disabled,
}: VillaIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | undefined>();
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = searchIcons(query, category);
  const SelectedIcon = value ? resolveLucideIcon(value) : null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onBlur]);

  const pick = (icon: VillaIconOption) => {
    onChange(icon.name);
    setOpen(false);
    onBlur?.();
  };

  return (
    <div ref={rootRef} className="relative" data-field={id}>
      <span className={dash.label}>{label}</span>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid && showError}
        className={`dash-icon-picker-trigger${invalid && showError ? " border-2 border-[#D32C55]" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        {SelectedIcon ? (
          <SelectedIcon size={18} className="text-[var(--dash-accent)]" />
        ) : null}
        <span className="flex-1 text-left text-sm">
          {value || "Choose icon"}
        </span>
        <ChevronDown size={16} className="opacity-50" />
      </button>
      {showError && errorMessage ? (
        <p className={dash.fieldError}>{errorMessage}</p>
      ) : null}

      {open ? (
        <div className="dash-icon-picker-panel" role="listbox">
          <div className="dash-icon-picker-panel__search">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons…"
                className={`${dash.input} w-full pl-8`}
                autoFocus
              />
            </div>
          </div>
          <div className="dash-icon-picker-panel__chips">
            <button
              type="button"
              className={`dash-icon-picker-chip${!category ? " dash-icon-picker-chip--active" : ""}`}
              onClick={() => setCategory(undefined)}
            >
              All
            </button>
            {ICON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`dash-icon-picker-chip${category === cat ? " dash-icon-picker-chip--active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="dash-icon-picker-grid">
            {filtered.map((icon) => {
              const Icon = resolveLucideIcon(icon.name);
              if (!Icon) return null;
              return (
                <button
                  key={icon.name}
                  type="button"
                  role="option"
                  aria-selected={value === icon.name}
                  title={icon.name}
                  className={`dash-icon-picker-grid__btn${value === icon.name ? " dash-icon-picker-grid__btn--selected" : ""}`}
                  onClick={() => pick(icon)}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          <div className="border-t border-[var(--dash-border)] p-2">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`${dash.input} w-full text-sm`}
              aria-label={`${label} grouped select`}
            >
              <option value="">Select icon…</option>
              {ICON_CATEGORIES.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {searchIcons("", cat).map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { resolveLucideIcon };
