"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { html as htmlLang } from "@codemirror/lang-html";
import { useRouter } from "next/navigation";
import beautify from "js-beautify";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { BuilderHeader } from "./shared/BuilderHeader";
import {
  HTML_ELEMENT_GROUPS,
  HTML_SNIPPETS,
  wrapTag,
} from "./shared/htmlSnippets";
import {
  saveAndPublishBlog,
  saveBlogDraft,
  saveBlogExit,
  type BuilderPageData,
} from "./shared/saveBlog";
import type { CmsBlogSection } from "@/lib/cms/blogCms";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((m) => m.default),
  { ssr: false },
);

function getHtmlFromSections(sections: CmsBlogSection[]): string {
  const htmlSection = sections.find((s) => s.type === "html");
  return htmlSection?.rawHtml ?? "";
}

function sectionsFromHtml(html: string): CmsBlogSection[] {
  return [
    {
      sectionKey: "html-main",
      type: "html",
      rawHtml: html,
    },
  ];
}

function validateHtml(html: string): string | null {
  if (!html.trim()) return "HTML is empty";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const err = doc.querySelector("parsererror");
  if (err) return err.textContent ?? "Malformed HTML";
  return null;
}

type DomNode = {
  id: string;
  tag: string;
  attrs: Record<string, string>;
  children: DomNode[];
  selfClosing?: boolean;
};

let nodeCounter = 0;

function parseDomTree(html: string): DomNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "<div></div>", "text/html");
  const walk = (el: Element): DomNode => {
    nodeCounter += 1;
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      attrs[attr.name] = attr.value;
    }
    return {
      id: `node-${nodeCounter}`,
      tag: el.tagName.toLowerCase(),
      attrs,
      children: Array.from(el.children).map(walk),
    };
  };
  return Array.from(doc.body.children).map(walk);
}

type HtmlBuilderProps = {
  page: BuilderPageData;
};

export function HtmlBuilder({ page }: HtmlBuilderProps) {
  const router = useRouter();
  const [subMode, setSubMode] = useState<"code" | "visual">("code");
  const [html, setHtml] = useState(() => getHtmlFromSections(page.sections));
  const [validation, setValidation] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const title = page.meta?.title ?? "Untitled";
  const slug = page.meta?.slug ?? page.pageKey.replace(/^blog\//, "");

  const tree = useMemo(() => {
    nodeCounter = 0;
    return parseDomTree(html);
  }, [html]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (subMode === "code") {
        nodeCounter = 0;
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [html, subMode]);

  const persist = useCallback(
    async (mode: "draft" | "publish" | "exit") => {
      const err = validateHtml(html);
      if (err) {
        setValidation(err);
        return;
      }
      setSaving(true);
      setError(null);
      const sections = sectionsFromHtml(html);
      try {
        if (mode === "draft") {
          await saveBlogDraft(page, sections);
        } else if (mode === "publish") {
          await saveAndPublishBlog(page, sections);
          router.push("/dashboard/seo/blogs");
        } else {
          await saveBlogExit(page, sections);
          router.push("/dashboard/seo/blogs");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [html, page, router],
  );

  const formatHtml = () => {
    setHtml(
      beautify.html(html, {
        indent_size: 2,
        wrap_line_length: 100,
      }),
    );
  };

  const runValidate = () => {
    const err = validateHtml(html);
    setValidation(err ?? "HTML is well-formed");
  };

  const appendSnippet = (snippet: string) => {
    setHtml((h) => (h.trim() ? `${h}\n\n${snippet}` : snippet));
  };

  const appendTag = (tag: string) => {
    appendSnippet(wrapTag(tag));
  };

  const renderTree = (nodes: DomNode[], depth = 0): React.ReactNode =>
    nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: depth * 12 }}>
        <button
          type="button"
          onClick={() => setSelectedNodeId(node.id)}
          className={`font-mono text-xs ${
            selectedNodeId === node.id ? "text-[#EFCD62]" : "text-white/60"
          }`}
        >
          &lt;{node.tag}&gt;
        </button>
        {node.children.length > 0 && renderTree(node.children, depth + 1)}
      </div>
    ));

  const selectedNode = (() => {
    const find = (nodes: DomNode[]): DomNode | null => {
      for (const n of nodes) {
        if (n.id === selectedNodeId) return n;
        const child = find(n.children);
        if (child) return child;
      }
      return null;
    };
    return selectedNodeId ? find(tree) : null;
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BuilderHeader
        title={title}
        slug={slug}
        pageKey={page.pageKey}
        saving={saving}
        onSaveExit={() => persist("exit")}
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
        {(["code", "visual"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSubMode(m)}
            className={`min-h-[36px] px-3 font-manrope text-xs font-bold uppercase tracking-wider ${
              subMode === m
                ? "bg-[#EFCD62]/20 text-[#EFCD62]"
                : "text-white/50 hover:text-white"
            }`}
          >
            {m === "code" ? "Code" : "Visual"}
          </button>
        ))}
        {subMode === "code" && (
          <>
            <button
              type="button"
              onClick={formatHtml}
              className={`${dash.btn} ${dash.btnText}`}
            >
              Format HTML
            </button>
            <button
              type="button"
              onClick={runValidate}
              className={`${dash.btn} ${dash.btnText}`}
            >
              Validate
            </button>
          </>
        )}
      </div>

      {subMode === "code" ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
          <div className="min-h-[320px] overflow-hidden border-r border-white/10">
            <CodeMirror
              value={html}
              height="100%"
              theme="dark"
              extensions={[htmlLang()]}
              onChange={(v) => setHtml(v)}
              className="min-h-[320px] text-sm"
            />
          </div>
          <div className="min-h-[320px] bg-[#25282C]">
            <iframe
              title="HTML preview"
              sandbox="allow-same-origin"
              srcDoc={`<!DOCTYPE html><html><head><style>body{font-family:system-ui;background:#25282C;color:#fff;padding:1.5rem;margin:0;line-height:1.6}a{color:#EFCD62}</style></head><body>${html}</body></html>`}
              className="h-full min-h-[320px] w-full border-0"
            />
          </div>
        </div>
      ) : (
        <div className="blog-builder-layout grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[12rem_1fr_14rem]">
          <aside className="blog-builder-sidebar overflow-y-auto border-r border-white/10 p-3 text-xs">
            {HTML_ELEMENT_GROUPS.map((group) => (
              <div key={group.category} className="mb-4">
                <p className={`${dash.label} mb-2`}>{group.category}</p>
                <div className="flex flex-wrap gap-1">
                  {group.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => appendTag(tag)}
                      className="border border-white/10 px-2 py-1 font-mono text-white/60 hover:text-[#EFCD62]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className={`${dash.label} mb-2`}>Advanced snippets</p>
            {HTML_SNIPPETS.filter((s) => s.category === "Advanced").map(
              (s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => appendSnippet(s.html)}
                  className="mb-1 block w-full border border-white/10 px-2 py-1 text-left text-white/60 hover:text-[#EFCD62]"
                >
                  {s.label}
                </button>
              ),
            )}
          </aside>
          <main className="overflow-y-auto p-4">
            <p className={`${dash.label} mb-2`}>DOM outline</p>
            {tree.length === 0 ? (
              <p className={dash.muted}>Add elements from the palette.</p>
            ) : (
              renderTree(tree)
            )}
            <div className="mt-6">
              <iframe
                title="Visual HTML preview"
                sandbox="allow-same-origin"
                srcDoc={`<!DOCTYPE html><html><head><style>body{font-family:system-ui;background:#25282C;color:#fff;padding:1.5rem;margin:0;line-height:1.6}a{color:#EFCD62}</style></head><body>${html}</body></html>`}
                className="h-64 w-full border border-white/10"
              />
            </div>
          </main>
          <aside className="border-l border-white/10 p-3">
            <p className={`${dash.label} mb-2`}>Attributes</p>
            {selectedNode ? (
              <div className="space-y-2 text-xs">
                <p className="font-mono text-[#EFCD62]">&lt;{selectedNode.tag}&gt;</p>
                {Object.entries(selectedNode.attrs).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-white/40">{k}: </span>
                    <span className="text-white/70">{v}</span>
                  </div>
                ))}
                {!Object.keys(selectedNode.attrs).length && (
                  <p className={dash.muted}>No attributes — edit in Code mode.</p>
                )}
              </div>
            ) : (
              <p className={dash.muted}>Select a node in the outline.</p>
            )}
          </aside>
        </div>
      )}

      {validation && (
        <p
          className={`px-4 py-2 text-sm ${
            validation === "HTML is well-formed"
              ? "text-emerald-300"
              : "text-amber-300"
          }`}
          role="status"
        >
          {validation}
        </p>
      )}
      {error && (
        <p className="px-4 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <footer className="flex flex-wrap gap-2 border-t border-white/10 p-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => persist("draft")}
          className={`${dash.btn} ${dash.btnText}`}
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => persist("publish")}
          className={`${dash.btn} ${dash.btnAccent}`}
        >
          Save & Publish
        </button>
      </footer>
    </div>
  );
}
