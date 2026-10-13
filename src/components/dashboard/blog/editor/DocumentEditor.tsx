"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  cmsSectionToBlogSection,
  sanitizeRichTextHtml,
  type CmsBlogSection,
} from "@/lib/cms/blogCms";
import {
  createBlock,
  filterSlashCommands,
  type SlashCommand,
} from "@/lib/cms/blogBlocks";
import { BlogSectionRenderer } from "@/components/blog/BlogSectionRenderer";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import {
  saveAndPublishBlog,
  saveBlogDraft,
  saveBlogExit,
  type BuilderPageData,
} from "@/app/dashboard/seo/blogs/build/[pageKey]/shared/saveBlog";
import { BuilderHeader } from "@/app/dashboard/seo/blogs/build/[pageKey]/shared/BuilderHeader";
import { BlockEditor } from "./BlockEditor";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditorPersistence } from "./useEditorPersistence";
import "@/styles/blog-editor.css";

type PreviewDevice = "desktop" | "tablet" | "mobile";

function SortableBlockRow({
  id,
  section,
  blogSlug,
  onChange,
  onRemove,
  onInsertAfter,
  slashIndex,
  onSlashQuery,
  autoFocus,
}: {
  id: string;
  section: CmsBlogSection;
  blogSlug: string;
  onChange: (section: CmsBlogSection) => void;
  onRemove: () => void;
  onInsertAfter: () => void;
  slashIndex: number | null;
  onSlashQuery: (index: number, query: string | null) => void;
  autoFocus?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <BlockEditor
        section={section}
        blogSlug={blogSlug}
        onChange={onChange}
        onRemove={onRemove}
        autoFocus={autoFocus}
        onSlashQuery={(q) => onSlashQuery(slashIndex ?? -1, q)}
        dragHandle={
          <button
            type="button"
            className="cursor-grab text-white/30 hover:text-white/60"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
      <button
        type="button"
        onClick={onInsertAfter}
        className="blog-editor-add-between"
        aria-label="Add block"
      >
        <Plus className="h-3.5 w-3.5" />
        Add block
      </button>
    </div>
  );
}

type DocumentEditorProps = {
  page: BuilderPageData;
};

function sanitizeSectionsForSave(sections: CmsBlogSection[]): CmsBlogSection[] {
  return sections.map((s) => {
    if (s.type === "text" || s.type === "quote") {
      return {
        ...s,
        content: s.content ? sanitizeRichTextHtml(s.content) : s.content,
      };
    }
    return s;
  });
}

export function DocumentEditor({ page }: DocumentEditorProps) {
  const router = useRouter();
  const initial = page.sections?.length ? page.sections.map((s) => ({ ...s })) : [createBlock("text")];
  const [sections, setSections] = useState<CmsBlogSection[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slashState, setSlashState] = useState<{
    index: number;
    query: string;
  } | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const baselineRef = useRef(JSON.stringify(initial));

  const title = page.meta?.title ?? "Untitled";
  const slug = page.meta?.slug ?? page.pageKey.replace(/^blog\//, "");

  const markDirty = useCallback((next: CmsBlogSection[]) => {
    setSections(next);
    setDirty(JSON.stringify(next) !== baselineRef.current);
  }, []);

  const { status, persist } = useEditorPersistence(
    page,
    sections,
    dirty,
    (recovered) => {
      markDirty(recovered);
      setDirty(true);
    },
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => sections.map((s) => s.sectionKey), [sections]);
  const previewSections = useMemo(
    () => sanitizeSectionsForSave(sections).map(cmsSectionToBlogSection),
    [sections],
  );

  const slashCommands = useMemo(
    () => (slashState ? filterSlashCommands(slashState.query) : []),
    [slashState],
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.sectionKey === active.id);
    const newIndex = sections.findIndex((s) => s.sectionKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    markDirty(arrayMove(sections, oldIndex, newIndex));
  };

  const insertBlockAt = (index: number, cmd?: SlashCommand) => {
    const block = createBlock(cmd?.type ?? "text");
    const next = [...sections];
    if (slashState && cmd) {
      next[slashState.index] = block;
      setSlashState(null);
    } else {
      next.splice(index + 1, 0, block);
    }
    setFocusKey(block.sectionKey);
    markDirty(next);
  };

  const updateAt = (index: number, section: CmsBlogSection) => {
    const next = [...sections];
    next[index] = section;
    markDirty(next);
  };

  const removeAt = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    markDirty(next.length ? next : [createBlock("text")]);
  };

  const persistAll = async (mode: "draft" | "publish" | "exit" | "unpublish") => {
    setSaving(true);
    setError(null);
    const clean = sanitizeSectionsForSave(sections);
    try {
      if (mode === "draft") {
        await saveBlogDraft(page, clean);
        baselineRef.current = JSON.stringify(clean);
        setDirty(false);
        await persist();
      } else if (mode === "publish") {
        await saveAndPublishBlog(page, clean);
        baselineRef.current = JSON.stringify(clean);
        router.push("/dashboard/seo/blogs");
      } else if (mode === "unpublish") {
        await saveBlogDraft(page, clean);
        const res = await dashboardFetch("/api/dashboard/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageKey: page.pageKey, publish: false }),
        });
        if (!res.ok) throw new Error("Unpublish failed");
        router.push("/dashboard/seo/blogs");
      } else {
        await saveBlogExit(page, clean);
        router.push("/dashboard/seo/blogs");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deviceClass =
    device === "mobile"
      ? "blog-preview-mobile"
      : device === "tablet"
        ? "blog-preview-tablet"
        : "blog-preview-desktop";

  const statusLabel =
    status === "saving"
      ? "Saving…"
      : dirty
        ? "Unsaved changes"
        : "Saved";

  return (
    <div className="blog-document-editor flex min-h-0 flex-1 flex-col">
      <BuilderHeader
        title={title}
        slug={slug}
        pageKey={page.pageKey}
        saving={saving || status === "saving"}
        onSaveExit={() => persistAll("exit")}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`font-manrope text-xs uppercase tracking-wider ${
              dirty ? "text-amber-300" : "text-emerald-300/80"
            }`}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => insertBlockAt(sections.length - 1)}
            className={`${dash.btn} ${dash.btnText}`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add block
          </button>
        </div>
        <div className="flex items-center gap-2">
          {preview && (
            <div className="flex gap-1">
              {(
                [
                  ["desktop", Monitor],
                  ["tablet", Tablet],
                  ["mobile", Smartphone],
                ] as const
              ).map(([d, Icon]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`blog-editor-device-btn ${device === d ? "is-active" : ""}`}
                  title={`${d} preview`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={`${dash.btn} ${dash.btnText}`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {preview ? (
            <div className={`blog-preview-frame ${deviceClass}`}>
              <div className="rounded border border-white/10 bg-[#25282C] p-6">
                <BlogSectionRenderer sections={previewSections} />
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {sections.map((section, index) => (
                    <div key={section.sectionKey} className="relative">
                      {slashState?.index === index && (
                        <SlashCommandMenu
                          commands={slashCommands}
                          onSelect={(cmd) => insertBlockAt(index, cmd)}
                          onClose={() => setSlashState(null)}
                        />
                      )}
                      <SortableBlockRow
                        id={section.sectionKey}
                        section={section}
                        blogSlug={slug}
                        onChange={(s) => updateAt(index, s)}
                        onRemove={() => removeAt(index)}
                        onInsertAfter={() => insertBlockAt(index)}
                        slashIndex={index}
                        onSlashQuery={(i, query) => {
                          if (query !== null) {
                            setSlashState({ index: i, query });
                          } else {
                            setSlashState(null);
                          }
                        }}
                        autoFocus={focusKey === section.sectionKey}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>

      {error && (
        <p className="px-4 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <footer className="flex flex-wrap gap-2 border-t border-white/10 p-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => persistAll("draft")}
          className={`${dash.btn} ${dash.btnText}`}
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => persistAll("publish")}
          className={`${dash.btn} ${dash.btnAccent}`}
        >
          Publish
        </button>
        {page.status === "published" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => persistAll("unpublish")}
            className={`${dash.btn} ${dash.btnText}`}
          >
            Unpublish
          </button>
        )}
      </footer>
    </div>
  );
}
