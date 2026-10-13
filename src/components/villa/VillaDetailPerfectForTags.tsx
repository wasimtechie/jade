"use client";

import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

export default function VillaDetailPerfectForTags({ tags }: { tags: string[] }) {
  if (!tags?.length) return null;

  return (
    <div className={vd.stackSm}>
      <h4 className="text-white font-manrope font-medium text-gh-body">
        Perfect for:
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((label, idx) => (
          <span
            key={`${label}-${idx}`}
            className="px-4 py-2 bg-white/5 border border-white/15 text-white/90 text-[11px] md:text-gh-label font-manrope"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
