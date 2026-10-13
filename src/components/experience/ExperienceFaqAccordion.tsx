"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

export default function ExperienceFaqAccordion({
  items,
}: {
  items: FaqItem[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div
            key={i}
            className="border border-white/10 rounded-sm bg-black/15 overflow-hidden"
          >
            <button
              type="button"
              aria-expanded={expanded}
              className="w-full flex items-center justify-between gap-2.5 px-4 py-3 text-left outline-none hover:bg-white/[0.04] transition-colors focus-visible:ring-2 focus-visible:ring-[#EFCD62]/55"
              onClick={() => setOpen(expanded ? null : i)}
            >
              <span className="text-white font-manrope font-bold text-gh-body leading-snug pr-2">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-[#EFCD62] transition-transform duration-200 ${ expanded ? "rotate-180" : "" }`}
                aria-hidden
              />
            </button>
            {expanded ? (
              <div className="px-4 pb-3 pt-0 text-white/65 text-gh-desc leading-snug border-t border-white/5 bg-black/10">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ExperiencePolicyCompactList({
  policies,
}: {
  policies: { title: string; desc: string }[];
}) {
  return (
    <div className="space-y-3">
      {policies.map((policy) => (
        <div key={policy.title} className="flex gap-2.5">
          <div
            className="w-2 h-2 rotate-45 bg-[#EFCD62] shrink-0 mt-1.5 opacity-90"
            aria-hidden
          />
          <div>
            <h4 className="font-manrope text-gh-body font-semibold mb-0.5 text-white">
              {policy.title}
            </h4>
            <p className="text-white/50 text-gh-desc leading-relaxed">
              {policy.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
