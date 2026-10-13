"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  wizardHintClass,
  wizardInputClass,
  wizardLabelClass,
} from "./wizardFieldStyles";

type BrochureUploadFieldProps = {
  url: string;
  filename: string;
  onChange: (url: string, filename: string) => void;
  villaSlug: string;
  disabled?: boolean;
};

export function BrochureUploadField({
  url,
  filename,
  onChange,
  villaSlug,
  disabled,
}: BrochureUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    if (!file || disabled) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("villaSlug", villaSlug);
      const res = await dashboardFetch("/api/dashboard/media/upload-document", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        filename?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }
      onChange(data.url, data.filename ?? file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className={wizardLabelClass}>Villa brochure</label>
      <p className={wizardHintClass}>
        PDF, Word, or PowerPoint — powers the &quot;Download Brochure&quot;
        button on the public villa page.
      </p>
      <div className="mt-3 space-y-3">
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            className={`${wizardInputClass} pl-10`}
            value={url}
            onChange={(e) => onChange(e.target.value, filename)}
            placeholder="/brochures/villa.pdf or /api/cms/media/..."
            disabled={disabled}
          />
        </div>
        {filename ? (
          <p className="font-manrope text-xs text-white/50">
            File: <span className="text-white/80">{filename}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className={`${dash.btn} ${dash.btnAccent} ${dash.btnDense}`}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload brochure"}
          </button>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
            >
              <Download className="h-4 w-4" />
              Preview
            </a>
          ) : null}
          {url ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange("", "")}
              className="font-manrope text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="font-manrope text-xs text-red-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
