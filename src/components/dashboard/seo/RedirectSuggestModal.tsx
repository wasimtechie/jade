"use client";

import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { GLASS_CHROME_FRAME_CLASS } from "@/lib/glassChrome";

type RedirectSuggestModalProps = {
  open: boolean;
  fromPath: string;
  toPath: string;
  onClose: () => void;
  onCreated?: () => void;
};

export function RedirectSuggestModal({
  open,
  fromPath,
  toPath,
  onClose,
  onCreated,
}: RedirectSuggestModalProps) {
  if (!open) return null;

  const create = async () => {
    const res = await dashboardFetch("/api/dashboard/seo/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPath, toPath, type: "301" }),
    });
    if (res.ok) {
      onCreated?.();
      onClose();
    }
  };

  return (
    <div className={dash.modalOverlay} onClick={onClose}>
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} ${dash.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={dash.modalBody}>
        <h3 className="font-philosopher text-xl text-white">Create 301 redirect?</h3>
        <p className="mt-2 text-sm text-white/60">
          The slug changed. A redirect preserves SEO equity from the old URL.
        </p>
        <div className="mt-4 space-y-2 font-mono text-xs">
          <p className="text-white/50">{fromPath}</p>
          <p className="text-[var(--dash-accent)]">→ {toPath}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={`${dash.btn} ${dash.btnText}`}>
            Skip
          </button>
          <button type="button" onClick={() => void create()} className={`${dash.btn} ${dash.btnAccent}`}>
            Create 301 redirect
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
