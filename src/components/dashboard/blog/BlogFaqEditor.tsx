"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import type { CmsBlogFaq } from "@/lib/cms/blogCms";

type BlogFaqEditorProps = {
  faqs: CmsBlogFaq[];
  onChange: (faqs: CmsBlogFaq[]) => void;
  faqSchemaEnabled: boolean;
};

export function BlogFaqEditor({
  faqs,
  onChange,
  faqSchemaEnabled,
}: BlogFaqEditorProps) {
  const list = faqs.length ? faqs : [{ question: "", answer: "" }];

  const updateAt = (index: number, patch: Partial<CmsBlogFaq>) => {
    const next = [...list];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeAt = (index: number) => {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length ? next : [{ question: "", answer: "" }]);
  };

  return (
    <div className={dash.stack}>
      <p className="font-manrope text-sm text-white/55">
        {faqSchemaEnabled
          ? "These questions will generate FAQ structured data when FAQ schema is enabled."
          : "Enable FAQ schema in the previous step to emit FAQ structured data."}
      </p>
      {list.map((faq, i) => (
        <div
          key={i}
          className="border border-white/10 bg-black/20 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-manrope text-xs font-bold uppercase tracking-wider text-white/40">
              FAQ {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="p-1 text-white/40 hover:text-white disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                className="p-1 text-white/40 hover:text-white disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Remove FAQ"
                onClick={() => removeAt(i)}
                className="p-1 text-red-400/70 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <input
            className={`${dash.input} mb-2 w-full`}
            placeholder="Question"
            value={faq.question}
            onChange={(e) => updateAt(i, { question: e.target.value })}
          />
          <textarea
            className={`${dash.input} min-h-[88px] w-full`}
            placeholder="Answer"
            value={faq.answer}
            onChange={(e) => updateAt(i, { answer: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className={`${dash.btn} ${dash.btnText}`}
        onClick={() =>
          onChange([...list, { question: "", answer: "" }])
        }
      >
        <Plus className="h-3 w-3" />
        Add FAQ
      </button>
    </div>
  );
}
