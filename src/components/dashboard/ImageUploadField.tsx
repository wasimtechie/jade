"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Link2, Images } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { MediaPickerModal } from "@/components/dashboard/MediaPickerModal";

const labelClass =
  "mb-1.5 block font-manrope text-[length:var(--fs-label)] font-bold uppercase tracking-widest text-[var(--dash-accent)]";
const inputClass =
  "min-h-[44px] w-full border-0 bg-transparent px-3 py-2.5 font-manrope text-[length:var(--fs-body)] text-white placeholder:text-white/55 focus:outline-none";
const hintClass = "mt-1.5 font-manrope text-xs text-[color:var(--dash-text-muted)]";

type ImageUploadFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  villaSlug: string;
  disabled?: boolean;
  /** Hide preview thumbnail (e.g. append-only add row) */
  compact?: boolean;
  placeholder?: string;
};

export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  villaSlug,
  disabled,
  compact = false,
  placeholder = "/Villa_Retreats/.../image.webp",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const onPick = async (file: File | null) => {
    if (!file || disabled) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("villaSlug", villaSlug);
      const res = await dashboardFetch("/api/dashboard/media/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        publicUrl?: string;
        variants?: Array<{ label: string; url: string }>;
        error?: string;
      };
      const webp = data.variants?.find((v) => v.label === "webp")?.url;
      const url = webp ?? data.publicUrl ?? data.url;
      if (!res.ok || !url) {
        throw new Error(data.error ?? "Upload failed");
      }
      onChange(url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {!compact && (
          <div className="relative isolate z-0 h-28 w-full shrink-0 overflow-hidden border border-white/15 bg-black/40 sm:h-[108px] sm:w-36">
            {value ? (
              <img
                src={value}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/20">
                <ImagePlus className="h-9 w-9" />
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1 rounded-sm border border-white/15 bg-black/20">
          {/* Path + library — single row */}
          <div className="flex items-stretch border-b border-white/10">
            <div className="relative min-w-0 flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                className={`${inputClass} pl-10 pr-2`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                aria-label={`${label} path`}
              />
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPickerOpen(true)}
              title="Open media library"
              className="inline-flex shrink-0 items-center gap-2 border-l border-white/10 bg-white/[0.04] px-4 font-manrope text-[11px] font-bold uppercase tracking-wider text-white/85 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <Images className="h-4 w-4 text-[var(--dash-accent)]" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </div>

          {/* Upload row */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-[36px] items-center gap-2 border border-[var(--dash-accent-border)] bg-[var(--dash-accent-muted)] px-3 font-manrope text-[11px] font-bold uppercase tracking-wider text-[var(--dash-accent)] transition-colors hover:bg-[var(--dash-accent-muted)] disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload → WebP"}
            </button>
            {value ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("")}
                className="font-manrope text-xs text-[color:var(--dash-text-muted)] underline-offset-2 hover:text-white/70 hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {hint ? (
        <p className={hintClass}>{hint}</p>
      ) : (
        <p className={hintClass}>
          Paste a public path, pick from the media library, or upload — converted
          to WebP automatically.
        </p>
      )}
      {uploadError ? (
        <p className="font-manrope text-xs text-red-400">{uploadError}</p>
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
        contextSlug={villaSlug}
      />
    </div>
  );
}
