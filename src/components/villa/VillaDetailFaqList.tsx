"use client";

import { useState } from "react";
import DetailsDrawer from "@/components/DetailsDrawer";

type FaqItem = { question: string; answer: string };

const INITIAL_VISIBLE = 3;

const viewMoreButtonClass =
  "w-fit rounded-sm font-manrope text-gh-label font-bold uppercase tracking-[0.2em] text-[#EFCD62] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EFCD62]/55";

function toDrawerItems(items: FaqItem[]) {
  return items.map((item) => ({
    label: item.question,
    icon: "",
    description: item.answer,
  }));
}

function FaqEntries({ items }: { items: FaqItem[] }) {
  return (
    <dl className="m-0 flex flex-col gap-6">
      {items.map((item, i) => (
        <div key={i} className="m-0">
          <dt className="m-0 flex items-start gap-2.5">
            <span
              className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-[#EFCD62] opacity-90"
              aria-hidden
            />
            <span className="font-manrope text-gh-body font-semibold leading-snug text-white">
              {item.question}
            </span>
          </dt>
          <dd className="m-0 ml-[18px] mt-2 font-manrope text-gh-desc leading-relaxed text-white/50">
            {item.answer}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type VillaDetailFaqListProps = {
  items: FaqItem[];
  /** Venue/experience overlays — expand remaining FAQs in place (no drawer). */
  expandInPlace?: boolean;
};

export default function VillaDetailFaqList({
  items,
  expandInPlace = false,
}: VillaDetailFaqListProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inlineExpanded, setInlineExpanded] = useState(false);

  if (!items?.length) return null;

  const hasMore = items.length > INITIAL_VISIBLE;
  const visibleItems =
    expandInPlace && inlineExpanded
      ? items
      : items.slice(0, INITIAL_VISIBLE);

  return (
    <>
      <div className="flex flex-col gap-6">
        <FaqEntries items={visibleItems} />
        {hasMore && expandInPlace && !inlineExpanded ? (
          <button
            type="button"
            onClick={() => setInlineExpanded(true)}
            className={viewMoreButtonClass}
          >
            VIEW MORE
          </button>
        ) : null}
        {hasMore && expandInPlace && inlineExpanded ? (
          <button
            type="button"
            onClick={() => setInlineExpanded(false)}
            className={viewMoreButtonClass}
          >
            VIEW LESS
          </button>
        ) : null}
        {hasMore && !expandInPlace ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={viewMoreButtonClass}
          >
            VIEW MORE
          </button>
        ) : null}
      </div>

      {!expandInPlace ? (
        <DetailsDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="FAQ"
          items={toDrawerItems(items)}
        />
      ) : null}
    </>
  );
}
