"use client";

import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { CmsBlogSection } from "@/lib/cms/blogCms";
import type { BlogBlockSettings } from "@/lib/cms/blogBlocks";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { isUnoptimizedMediaUrl } from "@/lib/media/urls";
import { RichTextEditor } from "./RichTextEditor";
import { parseVideoEmbed } from "@/lib/cms/videoEmbed";

type BlockEditorProps = {
  section: CmsBlogSection;
  blogSlug: string;
  onChange: (section: CmsBlogSection) => void;
  onSlashQuery?: (query: string | null) => void;
  autoFocus?: boolean;
  dragHandle?: React.ReactNode;
  onRemove: () => void;
};

function updateSettings(
  section: CmsBlogSection,
  patch: Partial<BlogBlockSettings>,
): CmsBlogSection {
  return { ...section, settings: { ...section.settings, ...patch } };
}

const BLOCK_LABELS: Record<string, string> = {
  text: "Paragraph",
  heading: "Heading",
  image: "Image",
  gallery: "Gallery",
  button: "Button",
  cta: "CTA",
  faq: "FAQ",
  quote: "Quote",
  divider: "Divider",
  video: "Video",
  table: "Table",
  callout: "Callout",
  html: "Custom HTML",
  list: "List",
};

export function BlockEditor({
  section,
  blogSlug,
  onChange,
  onSlashQuery,
  autoFocus,
  dragHandle,
  onRemove,
}: BlockEditorProps) {
  const type = section.type ?? "text";
  const settings = section.settings ?? {};
  const uploadSlug = `blog/${blogSlug}`;

  const update = (patch: Partial<CmsBlogSection>) =>
    onChange({ ...section, ...patch });

  return (
    <div className="blog-editor-block group">
      <div className="blog-editor-block-chrome">
        <div className="flex items-center gap-2">
          {dragHandle ?? (
            <span className="cursor-grab text-white/30">
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          <span className="blog-editor-block-label">
            {BLOCK_LABELS[type] ?? type}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-white/30 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
          aria-label="Remove block"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="blog-editor-block-body">
        {(type === "text" || type === "quote") && (
          <RichTextEditor
            content={section.content ?? ""}
            blogSlug={blogSlug}
            onChange={(html) => update({ content: html })}
            onSlashQuery={onSlashQuery}
            autoFocus={autoFocus}
            placeholder={
              type === "quote"
                ? "Enter quote…"
                : "Type / for commands, or start writing…"
            }
          />
        )}

        {type === "heading" && (
          <div className={dash.stack}>
            <select
              className={`${dash.input} w-full max-w-[8rem]`}
              value={section.level ?? 2}
              onChange={(e) => update({ level: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  H{n}
                </option>
              ))}
            </select>
            <input
              className={`${dash.input} w-full font-philosopher text-xl text-white`}
              placeholder="Heading text"
              value={section.content ?? ""}
              onChange={(e) => update({ content: e.target.value })}
              autoFocus={autoFocus}
            />
          </div>
        )}

        {type === "image" && (
          <div className={dash.stack}>
            <ImageUploadField
              label="Image"
              value={section.image ?? ""}
              onChange={(url) => update({ image: url })}
              villaSlug={uploadSlug}
            />
            <div className={dash.formGrid2}>
              <input
                className={`${dash.input} w-full`}
                placeholder="Alt text"
                value={settings.alt ?? ""}
                onChange={(e) =>
                  onChange(updateSettings(section, { alt: e.target.value }))
                }
              />
              <input
                className={`${dash.input} w-full`}
                placeholder="Caption"
                value={section.caption ?? ""}
                onChange={(e) => update({ caption: e.target.value })}
              />
            </div>
            <div className={dash.formGrid2}>
              <select
                className={`${dash.input} w-full`}
                value={settings.alignment ?? "center"}
                onChange={(e) =>
                  onChange(
                    updateSettings(section, {
                      alignment: e.target.value as BlogBlockSettings["alignment"],
                    }),
                  )
                }
              >
                <option value="left">Align left</option>
                <option value="center">Align center</option>
                <option value="right">Align right</option>
              </select>
              <select
                className={`${dash.input} w-full`}
                value={settings.width ?? "large"}
                onChange={(e) =>
                  onChange(
                    updateSettings(section, {
                      width: e.target.value as BlogBlockSettings["width"],
                    }),
                  )
                }
              >
                <option value="medium">Medium width</option>
                <option value="large">Large width</option>
                <option value="full">Full width</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={settings.rounded ?? false}
                onChange={(e) =>
                  onChange(updateSettings(section, { rounded: e.target.checked }))
                }
              />
              Rounded corners
            </label>
          </div>
        )}

        {type === "gallery" && (
          <GalleryEditor
            section={section}
            uploadSlug={uploadSlug}
            onChange={onChange}
          />
        )}

        {type === "button" && (
          <div className={dash.stack}>
            <input
              className={`${dash.input} w-full`}
              placeholder="Button text"
              value={section.ctas?.[0]?.label ?? ""}
              onChange={(e) => {
                const ctas = [...(section.ctas ?? [{ label: "", link: "", variant: "primary" }])];
                ctas[0] = { ...ctas[0], label: e.target.value };
                update({ ctas });
              }}
            />
            <input
              className={`${dash.input} w-full`}
              placeholder="Button URL"
              value={section.ctas?.[0]?.link ?? ""}
              onChange={(e) => {
                const ctas = [...(section.ctas ?? [{ label: "", link: "", variant: "primary" }])];
                ctas[0] = { ...ctas[0], link: e.target.value };
                update({ ctas });
              }}
            />
            <div className={dash.formGrid2}>
              <select
                className={`${dash.input} w-full`}
                value={settings.buttonVariant ?? "primary"}
                onChange={(e) =>
                  onChange(
                    updateSettings(section, {
                      buttonVariant: e.target.value as BlogBlockSettings["buttonVariant"],
                    }),
                  )
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={settings.openInNewTab ?? false}
                  onChange={(e) =>
                    onChange(
                      updateSettings(section, { openInNewTab: e.target.checked }),
                    )
                  }
                />
                Open in new tab
              </label>
            </div>
            <div className="blog-editor-preview-chip">
              <span
                className={`blog-prose-cta blog-prose-cta--${settings.buttonVariant === "outline" ? "outline" : "primary"}`}
              >
                {section.ctas?.[0]?.label || "Button"}
              </span>
            </div>
          </div>
        )}

        {type === "cta" && (
          <div className={dash.stack}>
            <input
              className={`${dash.input} w-full`}
              placeholder="CTA title"
              value={settings.ctaTitle ?? ""}
              onChange={(e) =>
                onChange(updateSettings(section, { ctaTitle: e.target.value }))
              }
            />
            <textarea
              className={`${dash.input} min-h-[72px] w-full`}
              placeholder="CTA description"
              value={settings.ctaDescription ?? ""}
              onChange={(e) =>
                onChange(
                  updateSettings(section, { ctaDescription: e.target.value }),
                )
              }
            />
            <div className={dash.formGrid2}>
              <input
                className={`${dash.input} w-full`}
                placeholder="Button text"
                value={section.ctas?.[0]?.label ?? ""}
                onChange={(e) => {
                  const ctas = [...(section.ctas ?? [{ label: "", link: "", variant: "primary" }])];
                  ctas[0] = { ...ctas[0], label: e.target.value };
                  update({ ctas });
                }}
              />
              <input
                className={`${dash.input} w-full`}
                placeholder="Button URL"
                value={section.ctas?.[0]?.link ?? ""}
                onChange={(e) => {
                  const ctas = [...(section.ctas ?? [{ label: "", link: "", variant: "primary" }])];
                  ctas[0] = { ...ctas[0], link: e.target.value };
                  update({ ctas });
                }}
              />
            </div>
            <div className="blog-editor-cta-preview">
              {settings.ctaTitle && (
                <p className="font-philosopher text-lg text-white">
                  {settings.ctaTitle}
                </p>
              )}
              {settings.ctaDescription && (
                <p className="text-sm text-white/60">{settings.ctaDescription}</p>
              )}
              <span className="blog-prose-cta blog-prose-cta--primary mt-2 inline-flex">
                {section.ctas?.[0]?.label || "Learn more"}
              </span>
            </div>
          </div>
        )}

        {type === "faq" && <FaqBlockEditor section={section} onChange={onChange} />}

        {type === "list" && <ListBlockEditor section={section} onChange={onChange} />}

        {type === "table" && (
          <TableBlockEditor section={section} onChange={onChange} />
        )}

        {type === "video" && (
          <div className={dash.stack}>
            <input
              className={`${dash.input} w-full`}
              placeholder="YouTube or Vimeo URL"
              value={settings.videoUrl ?? ""}
              onChange={(e) =>
                onChange(updateSettings(section, { videoUrl: e.target.value }))
              }
            />
            {settings.videoUrl && parseVideoEmbed(settings.videoUrl).embedUrl && (
              <div className="relative aspect-video w-full overflow-hidden border border-white/10">
                <iframe
                  src={parseVideoEmbed(settings.videoUrl).embedUrl!}
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            )}
          </div>
        )}

        {type === "callout" && (
          <div className={dash.stack}>
            <select
              className={`${dash.input} w-full max-w-[12rem]`}
              value={settings.calloutType ?? "info"}
              onChange={(e) =>
                onChange(
                  updateSettings(section, {
                    calloutType: e.target.value as BlogBlockSettings["calloutType"],
                  }),
                )
              }
            >
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="note">Note</option>
              <option value="tip">Tip</option>
            </select>
            <textarea
              className={`${dash.input} min-h-[88px] w-full`}
              placeholder="Callout content"
              value={section.content ?? ""}
              onChange={(e) => update({ content: e.target.value })}
            />
            <div
              className={`blog-prose-callout blog-prose-callout--${settings.calloutType ?? "info"}`}
            >
              {section.content || "Callout preview"}
            </div>
          </div>
        )}

        {type === "divider" && (
          <hr className="blog-editor-divider" aria-hidden />
        )}

        {type === "html" && (
          <textarea
            className={`${dash.input} min-h-[160px] w-full font-mono text-sm`}
            placeholder="Paste custom HTML or embed code"
            value={section.rawHtml ?? ""}
            onChange={(e) => update({ rawHtml: e.target.value })}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

function FaqBlockEditor({
  section,
  onChange,
}: {
  section: CmsBlogSection;
  onChange: (s: CmsBlogSection) => void;
}) {
  const faqs = section.faqs ?? [{ question: "", answer: "" }];
  const updateFaq = (i: number, patch: Partial<{ question: string; answer: string }>) => {
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    onChange({ ...section, faqs: next });
  };
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= faqs.length) return;
    const next = [...faqs];
    [next[i], next[t]] = [next[t], next[i]];
    onChange({ ...section, faqs: next });
  };

  return (
    <div className={dash.stack}>
      {faqs.map((faq, i) => (
        <div key={i} className="border border-white/10 p-3">
          <div className="mb-2 flex justify-end gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-white/40">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === faqs.length - 1} className="p-1 text-white/40">
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...section,
                  faqs: faqs.filter((_, j) => j !== i).length
                    ? faqs.filter((_, j) => j !== i)
                    : [{ question: "", answer: "" }],
                })
              }
              className="p-1 text-red-400/70"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            className={`${dash.input} mb-2 w-full`}
            placeholder="Question"
            value={faq.question}
            onChange={(e) => updateFaq(i, { question: e.target.value })}
          />
          <textarea
            className={`${dash.input} min-h-[72px] w-full`}
            placeholder="Answer"
            value={faq.answer}
            onChange={(e) => updateFaq(i, { answer: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className={`${dash.btn} ${dash.btnText}`}
        onClick={() =>
          onChange({ ...section, faqs: [...faqs, { question: "", answer: "" }] })
        }
      >
        <Plus className="h-3 w-3" />
        Add FAQ
      </button>
    </div>
  );
}

function ListBlockEditor({
  section,
  onChange,
}: {
  section: CmsBlogSection;
  onChange: (s: CmsBlogSection) => void;
}) {
  const items = section.items ?? [""];
  const listStyle = section.settings?.listStyle ?? "bullet";

  return (
    <div className={dash.stack}>
      <select
        className={`${dash.input} w-full max-w-[12rem]`}
        value={listStyle}
        onChange={(e) =>
          onChange({
            ...section,
            settings: {
              ...section.settings,
              listStyle: e.target.value as "bullet" | "ordered" | "checklist",
            },
          })
        }
      >
        <option value="bullet">Bullet list</option>
        <option value="ordered">Numbered list</option>
        <option value="checklist">Checklist</option>
      </select>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          {listStyle === "checklist" && (
            <input type="checkbox" className="mt-3" readOnly />
          )}
          <input
            className={`${dash.input} w-full`}
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange({ ...section, items: next });
            }}
          />
        </div>
      ))}
      <button
        type="button"
        className={`${dash.btn} ${dash.btnText}`}
        onClick={() => onChange({ ...section, items: [...items, ""] })}
      >
        Add item
      </button>
    </div>
  );
}

function TableBlockEditor({
  section,
  onChange,
}: {
  section: CmsBlogSection;
  onChange: (s: CmsBlogSection) => void;
}) {
  const table = section.tableData ?? { headers: ["Col 1", "Col 2"], rows: [["", ""]] };

  const setHeader = (i: number, val: string) => {
    const headers = [...table.headers];
    headers[i] = val;
    onChange({ ...section, tableData: { ...table, headers } });
  };

  const setCell = (ri: number, ci: number, val: string) => {
    const rows = table.rows.map((r) => [...r]);
    rows[ri][ci] = val;
    onChange({ ...section, tableData: { ...table, rows } });
  };

  return (
    <div className={dash.stack}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} className="border border-white/15 p-1">
                  <input
                    className={`${dash.input} w-full min-w-[6rem]`}
                    value={h}
                    onChange={(e) => setHeader(i, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-white/15 p-1">
                    <input
                      className={`${dash.input} w-full`}
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${dash.btn} ${dash.btnText}`}
          onClick={() =>
            onChange({
              ...section,
              tableData: {
                headers: table.headers,
                rows: [...table.rows, table.headers.map(() => "")],
              },
            })
          }
        >
          Add row
        </button>
        <button
          type="button"
          className={`${dash.btn} ${dash.btnText}`}
          onClick={() =>
            onChange({
              ...section,
              tableData: {
                headers: [...table.headers, `Col ${table.headers.length + 1}`],
                rows: table.rows.map((r) => [...r, ""]),
              },
            })
          }
        >
          Add column
        </button>
        <button
          type="button"
          className={`${dash.btn} ${dash.btnText}`}
          disabled={table.rows.length <= 1}
          onClick={() =>
            onChange({
              ...section,
              tableData: { ...table, rows: table.rows.slice(0, -1) },
            })
          }
        >
          Delete row
        </button>
        <button
          type="button"
          className={`${dash.btn} ${dash.btnText}`}
          disabled={table.headers.length <= 1}
          onClick={() =>
            onChange({
              ...section,
              tableData: {
                headers: table.headers.slice(0, -1),
                rows: table.rows.map((r) => r.slice(0, -1)),
              },
            })
          }
        >
          Delete column
        </button>
      </div>
    </div>
  );
}

function GalleryEditor({
  section,
  uploadSlug,
  onChange,
}: {
  section: CmsBlogSection;
  uploadSlug: string;
  onChange: (s: CmsBlogSection) => void;
}) {
  const images = section.settings?.galleryImages ?? [];
  const layout = section.settings?.layout ?? "grid";

  const updateImage = (i: number, patch: Partial<{ url: string; alt?: string; caption?: string }>) => {
    const next = [...images];
    next[i] = { ...next[i], ...patch };
    onChange({
      ...section,
      settings: { ...section.settings, galleryImages: next },
    });
  };

  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= images.length) return;
    const next = [...images];
    [next[i], next[t]] = [next[t], next[i]];
    onChange({ ...section, settings: { ...section.settings, galleryImages: next } });
  };

  return (
    <div className={dash.stack}>
      <select
        className={`${dash.input} w-full max-w-[12rem]`}
        value={layout}
        onChange={(e) =>
          onChange({
            ...section,
            settings: {
              ...section.settings,
              layout: e.target.value as "grid" | "carousel",
            },
          })
        }
      >
        <option value="grid">Grid layout</option>
        <option value="carousel">Carousel layout</option>
      </select>
      {images.map((img, i) => (
        <div key={i} className="border border-white/10 p-3">
          <div className="mb-2 flex justify-end gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-white/40">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="p-1 text-white/40">
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...section,
                  settings: {
                    ...section.settings,
                    galleryImages: images.filter((_, j) => j !== i),
                  },
                })
              }
              className="p-1 text-red-400/70"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <ImageUploadField
            label={`Image ${i + 1}`}
            value={img.url}
            onChange={(url) => updateImage(i, { url })}
            villaSlug={uploadSlug}
          />
          <input
            className={`${dash.input} mt-2 w-full`}
            placeholder="Alt text"
            value={img.alt ?? ""}
            onChange={(e) => updateImage(i, { alt: e.target.value })}
          />
          <input
            className={`${dash.input} mt-2 w-full`}
            placeholder="Caption"
            value={img.caption ?? ""}
            onChange={(e) => updateImage(i, { caption: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        className={`${dash.btn} ${dash.btnText}`}
        onClick={() =>
          onChange({
            ...section,
            settings: {
              ...section.settings,
              galleryImages: [...images, { url: "" }],
            },
          })
        }
      >
        <Plus className="h-3 w-3" />
        Add image
      </button>
      {images.length > 0 && (
        <div
          className={
            layout === "carousel"
              ? "flex gap-2 overflow-x-auto"
              : "grid grid-cols-2 gap-2 sm:grid-cols-3"
          }
        >
          {images
            .filter((g) => g.url)
            .map((g, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] shrink-0 overflow-hidden border border-white/10"
                style={layout === "carousel" ? { width: "8rem" } : undefined}
              >
                <Image src={g.url} alt="" fill className="object-cover" sizes="120px" unoptimized={isUnoptimizedMediaUrl(g.url)} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
