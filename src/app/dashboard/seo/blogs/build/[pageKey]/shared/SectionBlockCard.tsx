"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import type { CmsBlogSection } from "@/lib/cms/blogCms";

type SectionBlockCardProps = {
  section: CmsBlogSection;
  index: number;
  onChange: (index: number, section: CmsBlogSection) => void;
  onRemove: (index: number) => void;
  dragHandle?: ReactNode;
};

export function SectionBlockCard({
  section,
  index,
  onChange,
  onRemove,
  dragHandle,
}: SectionBlockCardProps) {
  const type = section.type ?? "text";

  const update = (patch: Partial<CmsBlogSection>) => {
    onChange(index, { ...section, ...patch });
  };

  return (
    <div className="border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {dragHandle}
          <span className="font-manrope text-xs font-bold uppercase tracking-widest text-[#EFCD62]/80">
            {type}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-300 hover:text-red-200"
          aria-label="Remove block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {type === "heading" && (
        <div className={dash.stack}>
          <select
            className={`${dash.input} w-full`}
            value={section.level ?? 2}
            onChange={(e) => update({ level: Number(e.target.value) })}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <input
            className={`${dash.input} w-full`}
            placeholder="Heading text"
            value={section.content ?? ""}
            onChange={(e) => update({ content: e.target.value })}
          />
        </div>
      )}

      {(type === "text" || type === "quote") && (
        <textarea
          className={`${dash.input} min-h-[120px] w-full`}
          placeholder={type === "quote" ? "Quote text" : "Paragraph text"}
          value={section.content ?? section.body ?? ""}
          onChange={(e) =>
            update({ content: e.target.value, body: e.target.value })
          }
        />
      )}

      {type === "image" && (
        <div className={dash.stack}>
          <input
            className={`${dash.input} w-full`}
            placeholder="Image URL"
            value={section.image ?? ""}
            onChange={(e) => update({ image: e.target.value })}
          />
          <input
            className={`${dash.input} w-full`}
            placeholder="Caption (optional)"
            value={section.caption ?? ""}
            onChange={(e) => update({ caption: e.target.value })}
          />
        </div>
      )}

      {type === "list" && (
        <div className={dash.stack}>
          {(section.items ?? [""]).map((item, i) => (
            <input
              key={i}
              className={`${dash.input} w-full`}
              value={item}
              onChange={(e) => {
                const items = [...(section.items ?? [])];
                items[i] = e.target.value;
                update({ items });
              }}
            />
          ))}
          <button
            type="button"
            className={`${dash.btn} ${dash.btnText}`}
            onClick={() => update({ items: [...(section.items ?? []), ""] })}
          >
            Add list item
          </button>
        </div>
      )}

      {type === "faq" && (
        <div className={dash.stack}>
          {(section.faqs ?? [{ question: "", answer: "" }]).map((faq, i) => (
            <div key={i} className="border border-white/10 p-3">
              <input
                className={`${dash.input} mb-2 w-full`}
                placeholder="Question"
                value={faq.question}
                onChange={(e) => {
                  const faqs = [...(section.faqs ?? [])];
                  faqs[i] = { ...faqs[i], question: e.target.value };
                  update({ faqs });
                }}
              />
              <textarea
                className={`${dash.input} min-h-[72px] w-full`}
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) => {
                  const faqs = [...(section.faqs ?? [])];
                  faqs[i] = { ...faqs[i], answer: e.target.value };
                  update({ faqs });
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className={`${dash.btn} ${dash.btnText}`}
            onClick={() =>
              update({
                faqs: [
                  ...(section.faqs ?? []),
                  { question: "", answer: "" },
                ],
              })
            }
          >
            Add FAQ
          </button>
        </div>
      )}

      {type === "cta" && (
        <div className={dash.stack}>
          {(section.ctas ?? []).map((cta, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              <input
                className={`${dash.input} w-full`}
                placeholder="Label"
                value={cta.label}
                onChange={(e) => {
                  const ctas = [...(section.ctas ?? [])];
                  ctas[i] = { ...ctas[i], label: e.target.value };
                  update({ ctas });
                }}
              />
              <input
                className={`${dash.input} w-full`}
                placeholder="Link"
                value={cta.link}
                onChange={(e) => {
                  const ctas = [...(section.ctas ?? [])];
                  ctas[i] = { ...ctas[i], link: e.target.value };
                  update({ ctas });
                }}
              />
              <select
                className={`${dash.input} w-full`}
                value={cta.variant}
                onChange={(e) => {
                  const ctas = [...(section.ctas ?? [])];
                  ctas[i] = { ...ctas[i], variant: e.target.value };
                  update({ ctas });
                }}
              >
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
