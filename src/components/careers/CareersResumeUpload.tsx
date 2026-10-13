"use client";

import type { Ref } from "react";
import { Upload, X } from "lucide-react";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";
import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";

const ACCEPT =
  ".pdf,application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.doc,.docx";

export default function CareersResumeUpload({
  selectedFileName,
  error,
  showError = false,
  inputRef,
  onFileChange,
  onClear,
}: {
  selectedFileName: string | null;
  error: string | null;
  /** When true, show 2px indicating border (after submit attempt). */
  showError?: boolean;
  inputRef: Ref<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  const indicating = showError && Boolean(error);

  return (
    <div className="flex flex-col items-center gap-2.5 py-3">
      <div
        className={
          indicating
            ? "rounded-sm border-2 border-[#D32C55] px-4 py-3"
            : "px-4 py-3"
        }
      >
        <label className="cursor-pointer flex items-center gap-2 text-[#EFCD62] hover:text-white transition-colors">
          <span className="uppercase tracking-[0.2em] text-gh-label font-bold">
            UPLOAD CV
            <span className="ml-1" style={{ color: JADE_FORM_WARN }} aria-hidden>
              *
            </span>
          </span>
          <Upload className="w-4 h-4" />
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      </div>

      {selectedFileName ? (
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 text-gh-label text-white/60 max-w-full overflow-hidden">
          <span className="truncate">{selectedFileName}</span>
          <button
            type="button"
            className="shrink-0"
            aria-label="Remove résumé"
            onClick={onClear}
          >
            <X className="w-3 h-3 hover:text-white" />
          </button>
        </div>
      ) : null}

      {showError && error ? (
        <JadeFormFieldError id="careers-resume-err" message={error} />
      ) : (
        <p className="text-[11px] text-white/35 font-manrope text-center max-w-xs">
          Required · PDF or image, max 4 MB
        </p>
      )}
    </div>
  );
}
