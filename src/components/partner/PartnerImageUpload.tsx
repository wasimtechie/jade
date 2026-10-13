"use client";

import type { Ref } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";
import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";

export type PartnerImageRow = { file: File; preview: string };

export default function PartnerImageUpload({
  images,
  error,
  showError = false,
  inputRef,
  onPickFiles,
  onRemove,
}: {
  images: PartnerImageRow[];
  error?: string;
  showError?: boolean;
  inputRef: Ref<HTMLInputElement>;
  onPickFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  const indicating = showError && Boolean(error);

  return (
    <div className="mt-5 flex flex-col items-center w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={onPickFiles}
        multiple
        accept="image/*"
        className="hidden"
      />
      <div
        className={
          indicating
            ? "w-full rounded-sm border-2 border-[#D32C55] px-4 py-3 flex flex-col items-center"
            : "w-full px-4 py-3 flex flex-col items-center"
        }
      >
        <button
          type="button"
          onClick={() => {
            const el =
              typeof inputRef === "object" && inputRef && "current" in inputRef
                ? inputRef.current
                : null;
            el?.click();
          }}
          className="flex items-center gap-2 text-[#EFCD62] text-gh-label font-bold tracking-widest uppercase hover:text-white transition-colors"
        >
          UPLOAD IMAGES
          <span className="ml-0.5" style={{ color: JADE_FORM_WARN }} aria-hidden>
            *
          </span>
          <Upload className="w-4 h-4" />
        </button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 w-full mt-4 mb-2">
          {images.map((img, i) => (
            <div
              key={`${img.file.name}-${i}`}
              className="relative aspect-square w-full bg-white/5 border border-white/10 rounded-sm overflow-hidden group/thumb"
            >
              <Image
                src={img.preview}
                alt={`Property upload ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-20"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="w-3.5 h-3.5 text-white stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {showError && error ? (
        <JadeFormFieldError id="partner-photos-err" message={error} />
      ) : (
        <p className="text-[11px] text-white/35 font-manrope text-center max-w-xs mt-2">
          Required · Up to 6 images
        </p>
      )}
    </div>
  );
}
