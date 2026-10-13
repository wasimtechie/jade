"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Grid3X3,
  History,
  LayoutList,
  Loader2,
  Pin,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { BLOG_POSTS } from "@/data/blogs";
import {
  blogPostToCmsPayload,
  buildPageUrl,
  displayTitleFromPage,
  inferBuilderMode,
  type CmsBlogMeta,
  type CmsBlogSection,
  type CmsPageStatus,
} from "@/lib/cms/blogCms";
import { STATUS_LABELS } from "@/lib/cms/blogWorkflow";
import type { SeoHealthResult } from "@/lib/cms/blogSeoHealth";
import { dashboardFetch, readDashboardApiError } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { DataTable, type DataTableColumn } from "../DataTable";
import { DashboardListToolbar } from "../ui/DashboardListToolbar";
import { DashboardModuleFrame } from "../ui/DashboardModuleFrame";
import { DashboardTabBar } from "../ui/DashboardTabBar";
import { DashboardFilterBar } from "../ui/DashboardFilterBar";
import { DashboardActionMenu } from "../ui/DashboardActionMenu";
import { DashboardDropdownMenu } from "../ui/DashboardDropdownMenu";
import { DashboardStatusBadge } from "../ui/DashboardStatusBadge";
import { BlogEditorModal } from "./BlogEditorModal";
import { BlogStatusBadge } from "./BlogStatusBadge";
import { BlogSeoHealthBadge } from "./BlogSeoHealthBadge";
import { BlogSeoIssueList } from "./BlogSeoIssueList";
import { BlogConfirmDialog } from "./BlogConfirmDialog";
import "@/styles/blog-admin.css";

type BlogListItem = {
  _id: string;
  pageKey: string;
  status: CmsPageStatus;
  meta: CmsBlogMeta;
  sections: CmsBlogSection[];
  updatedAt?: string;
  trashedAt?: string;
  editLock?: { userName?: string; expiresAt?: string };
  seoHealth: SeoHealthResult;
  sectionCount: number;
};

type Facets = { categories: string[]; authors: string[]; tags: string[] };

function fmtWhen(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRelative(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function BlogListDashboard() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/seo", role) : false;
  const isAdmin = role === "admin";

  const [items, setItems] = useState<BlogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets>({ categories: [], authors: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<{ page: BlogListItem | null; isNew: boolean } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const importBtnRef = useRef<HTMLButtonElement>(null);
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const [panel, setPanel] = useState<{
    type: "versions" | "changelog";
    pageKey: string;
    title: string;
  } | null>(null);
  const [panelData, setPanelData] = useState<unknown[]>([]);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
    danger?: boolean;
    label?: string;
  } | null>(null);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [seoFilter, setSeoFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [schemaFilter, setSchemaFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedSeo, setExpandedSeo] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        sort: "updated",
      });
      if (debouncedQ) params.set("q", debouncedQ);
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (authorFilter) params.set("author", authorFilter);
      if (seoFilter) params.set("seoScore", seoFilter);
      if (featuredOnly) params.set("featured", "1");
      if (showTrashed) params.set("includeTrashed", "1");
      if (tagFilter) params.set("tag", tagFilter);
      if (schemaFilter) params.set("schemaType", schemaFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await dashboardFetch(`/api/dashboard/blogs?${params}`);
      if (!res.ok) throw new Error(await readDashboardApiError(res, "Failed to load blogs"));
      const data = (await res.json()) as {
        items?: BlogListItem[];
        total?: number;
        facets?: Facets;
      };
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setFacets(data.facets ?? { categories: [], authors: [], tags: [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ, statusFilter, categoryFilter, authorFilter, seoFilter, featuredOnly, showTrashed, tagFilter, schemaFilter, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const editKey = searchParams.get("edit");
    if (!editKey || loading) return;
    const item = items.find((p) => p.pageKey === decodeURIComponent(editKey));
    if (item) setEditor({ page: item, isNew: false });
  }, [searchParams, items, loading]);

  const existingSlugs = useMemo(
    () => new Set(items.map((p) => p.pageKey.replace(/^blog\//, "").toLowerCase())),
    [items],
  );

  const importFromSite = async (slugs?: string[]) => {
    setBusy("import");
    try {
      const existing = new Set(items.map((p) => p.pageKey));
      const toImport = BLOG_POSTS.filter(
        (p) => (!slugs || slugs.includes(p.slug)) && !existing.has(`blog/${p.slug}`),
      );
      for (const post of toImport) {
        await dashboardFetch("/api/dashboard/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogPostToCmsPayload(post)),
        });
      }
      await load();
      setImportOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(null);
    }
  };

  const workflow = async (pageKey: string, action: string, note?: string) => {
    setBusy(pageKey);
    try {
      const res = await dashboardFetch(
        `/api/dashboard/blogs/${encodeURIComponent(pageKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, note }),
        },
      );
      if (!res.ok) throw new Error("Action failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
      setMenuKey(null);
    }
  };

  const duplicate = async (pageKey: string) => {
    setBusy(pageKey);
    try {
      const res = await dashboardFetch("/api/dashboard/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", pageKey }),
      });
      if (!res.ok) throw new Error("Duplicate failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duplicate failed");
    } finally {
      setBusy(null);
      setMenuKey(null);
    }
  };

  const bulkAction = async (action: string, payload?: Record<string, unknown>) => {
    if (!selected.size) return;
    setBusy("bulk");
    try {
      const res = await dashboardFetch("/api/dashboard/blogs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKeys: Array.from(selected),
          action,
          payload,
        }),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      setSelected(new Set());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBusy(null);
    }
  };

  const robotsIndexAction = async (
    pageKeys: string[],
    action: "set_noindex" | "set_index",
  ) => {
    if (!pageKeys.length) return;
    setBusy("bulk");
    try {
      const res = await dashboardFetch("/api/dashboard/blogs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKeys, action }),
      });
      if (!res.ok) throw new Error("Failed to update indexing");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update indexing");
    } finally {
      setBusy(null);
    }
  };

  const openPanel = async (
    type: "versions" | "changelog",
    pageKey: string,
    title: string,
  ) => {
    setPanel({ type, pageKey, title });
    setMenuKey(null);
    const path =
      type === "versions"
        ? `/api/dashboard/blogs/${encodeURIComponent(pageKey)}/versions`
        : `/api/dashboard/blogs/${encodeURIComponent(pageKey)}/changelog`;
    const res = await dashboardFetch(path);
    const data = (await res.json()) as { versions?: unknown[]; logs?: unknown[] };
    setPanelData(data.versions ?? data.logs ?? []);
  };

  const restoreVersion = async (pageKey: string, versionIndex: number) => {
    setConfirm({
      title: "Restore version?",
      message: "Current content will be replaced with the selected version.",
      label: "Restore",
      action: async () => {
        const res = await dashboardFetch(
          `/api/dashboard/blogs/${encodeURIComponent(pageKey)}/versions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ versionIndex }),
          },
        );
        if (!res.ok) throw new Error("Restore failed");
        setPanel(null);
        await load();
      },
    });
  };

  const schedulePost = (pageKey: string) => {
    const when = window.prompt(
      "Schedule publish (ISO datetime, e.g. 2026-06-25T10:00)",
      new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    );
    if (!when) return;
    void (async () => {
      setBusy(pageKey);
      try {
        const res = await dashboardFetch(
          `/api/dashboard/blogs/${encodeURIComponent(pageKey)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scheduledPublishAt: new Date(when).toISOString(),
            }),
          },
        );
        if (!res.ok) throw new Error("Schedule failed");
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Schedule failed");
      } finally {
        setBusy(null);
        setMenuKey(null);
      }
    })();
  };

  const toggleSelect = (pageKey: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageKey)) next.delete(pageKey);
      else next.add(pageKey);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.pageKey)));
  };

  const closeMenu = () => setMenuKey(null);

  const rowActions = (r: BlogListItem) => (
    <DashboardActionMenu
      open={menuKey === r.pageKey}
      onOpenChange={(open) => setMenuKey(open ? r.pageKey : null)}
    >
      <button
        type="button"
        onClick={() => {
          closeMenu();
          setEditor({ page: r, isNew: false });
        }}
      >
        Edit details
      </button>
      <Link href={buildPageUrl(r.pageKey, inferBuilderMode(r.sections))} onClick={closeMenu}>
        Open builder
      </Link>
      <button
        type="button"
        onClick={() => {
          closeMenu();
          void duplicate(r.pageKey);
        }}
      >
        <Copy className="inline h-3 w-3" /> Duplicate
      </button>
      {r.status === "draft" && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void workflow(r.pageKey, "submit_review");
          }}
        >
          Submit for review
        </button>
      )}
      {r.status === "in_review" && (
        <>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              void workflow(r.pageKey, "approve");
            }}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              void workflow(r.pageKey, "reject");
            }}
          >
            Reject
          </button>
        </>
      )}
      {["approved", "draft"].includes(r.status) && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            schedulePost(r.pageKey);
          }}
        >
          <Clock className="inline h-3 w-3" /> Schedule
        </button>
      )}
      {r.status !== "published" && r.status !== "trashed" && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void workflow(r.pageKey, "publish");
          }}
        >
          Publish
        </button>
      )}
      {r.status === "published" && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void workflow(r.pageKey, "unpublish");
          }}
        >
          Unpublish
        </button>
      )}
      {r.status !== "archived" && r.status !== "trashed" && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void workflow(r.pageKey, "archive");
          }}
        >
          Archive
        </button>
      )}
      {r.status === "archived" && (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void workflow(r.pageKey, "restore");
          }}
        >
          Restore from archive
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          closeMenu();
          void openPanel("versions", r.pageKey, displayTitleFromPage(r));
        }}
      >
        <History className="inline h-3 w-3" /> Versions
      </button>
      <button
        type="button"
        onClick={() => {
          closeMenu();
          void openPanel("changelog", r.pageKey, displayTitleFromPage(r));
        }}
      >
        Changelog
      </button>
      {r.meta.seo?.robotsIndex === false ? (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void robotsIndexAction([r.pageKey], "set_index");
          }}
        >
          Allow indexing
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void robotsIndexAction([r.pageKey], "set_noindex");
          }}
        >
          Set as noindex
        </button>
      )}
      {r.status === "trashed" ? (
        <>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              void workflow(r.pageKey, "restore_trash");
            }}
          >
            Restore from trash
          </button>
          <button
            type="button"
            className="text-danger"
            onClick={() => {
              closeMenu();
              setConfirm({
                title: "Delete permanently?",
                message: "This cannot be undone.",
                danger: true,
                label: "Delete forever",
                action: async () => {
                  const res = await dashboardFetch(
                    `/api/dashboard/blogs/${encodeURIComponent(r.pageKey)}?permanent=1`,
                    { method: "DELETE" },
                  );
                  if (!res.ok) throw new Error("Delete failed");
                  await load();
                },
              });
            }}
          >
            Delete permanently
          </button>
        </>
      ) : (
        <button
          type="button"
          className="text-danger"
          onClick={() => {
            closeMenu();
            setConfirm({
              title: "Move to trash?",
              message: "The blog will be kept for 30 days before permanent deletion.",
              danger: true,
              label: "Move to trash",
              action: async () => {
                await workflow(r.pageKey, "trash");
              },
            });
          }}
        >
          <Trash2 className="inline h-3 w-3" /> Trash
        </button>
      )}
    </DashboardActionMenu>
  );

  const toggleSeoExpand = (pageKey: string) => {
    setExpandedSeo((prev) => {
      const next = new Set(prev);
      if (next.has(pageKey)) next.delete(pageKey);
      else next.add(pageKey);
      return next;
    });
  };

  const activeFilterCount = [
    statusFilter,
    categoryFilter,
    authorFilter,
    seoFilter,
    tagFilter,
    schemaFilter,
    dateFrom,
    dateTo,
    featuredOnly,
    showTrashed,
  ].filter(Boolean).length;

  const columns: DataTableColumn<BlogListItem>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={items.length > 0 && selected.size === items.length}
          onChange={toggleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: (r) => (
        <input
          type="checkbox"
          checked={selected.has(r.pageKey)}
          onChange={() => toggleSelect(r.pageKey)}
          aria-label={`Select ${displayTitleFromPage(r)}`}
        />
      ),
    },
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-white">{displayTitleFromPage(r)}</p>
            {r.meta.isPinned && <Pin className="h-3 w-3 shrink-0 text-[var(--dash-accent)]" />}
            {r.meta.isFeatured && <Star className="h-3 w-3 shrink-0 text-amber-300" />}
            {r.meta.seo?.robotsIndex === false && (
              <DashboardStatusBadge tone="warning">Noindex</DashboardStatusBadge>
            )}
          </div>
          <p className="truncate font-mono text-xs text-white/40">
            /{r.meta.slug}/
          </p>
          {r.editLock?.userName && (
            <p className="text-[10px] text-sky-300">
              Editing: {r.editLock.userName}
              {isAdmin && (
                <button
                  type="button"
                  className="ml-1 underline"
                  onClick={() =>
                    void dashboardFetch(
                      `/api/dashboard/blogs/${encodeURIComponent(r.pageKey)}/lock`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "acquire",
                          userName: session?.user?.name,
                          force: true,
                        }),
                      },
                    )
                  }
                >
                  Take over
                </button>
              )}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="space-y-1">
          <BlogStatusBadge status={r.status} />
          {r.status === "scheduled" && r.meta.scheduledPublishAt && (
            <p className="text-[10px] text-amber-200/80">
              {fmtWhen(r.meta.scheduledPublishAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      cell: (r) => <span className="text-sm text-white/55">{r.meta.author || "—"}</span>,
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => <span className="text-sm text-white/55">{r.meta.category || "—"}</span>,
    },
    {
      key: "published",
      header: "Published",
      cell: (r) => (
        <span className="text-sm text-white/45">{r.meta.publishedAt || "—"}</span>
      ),
    },
    {
      key: "modified",
      header: "Modified",
      cell: (r) => (
        <span className="text-sm text-white/45" title={fmtWhen(r.updatedAt)}>
          {fmtRelative(r.updatedAt)}
        </span>
      ),
    },
    {
      key: "seo",
      header: "SEO",
      cell: (r) => (
        <div className="blog-seo-cell">
          {r.seoHealth.issues.length > 0 && (
            <button
              type="button"
              className="blog-seo-cell__toggle"
              aria-expanded={expandedSeo.has(r.pageKey)}
              aria-label={`${expandedSeo.has(r.pageKey) ? "Hide" : "Show"} SEO issues`}
              onClick={() => toggleSeoExpand(r.pageKey)}
            >
              {expandedSeo.has(r.pageKey) ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            className="border-0 bg-transparent p-0"
            onClick={() => r.seoHealth.issues.length > 0 && toggleSeoExpand(r.pageKey)}
          >
            <BlogSeoHealthBadge health={r.seoHealth} />
          </button>
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      cell: (r) => (
        <span className="text-sm text-white/30">{r.meta.analytics?.views ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) =>
        canWrite ? (
          rowActions(r)
        ) : (
          <Link
            href={`/${r.meta.slug}/`}
            target="_blank"
            className="text-xs text-white/50"
          >
            View
          </Link>
        ),
    },
  ];

  const importable = BLOG_POSTS.filter(
    (p) => !existingSlugs.has(p.slug.toLowerCase()),
  );

  return (
    <>
      <DashboardModuleFrame
        toolbar={
          <DashboardListToolbar onRefresh={load} refreshing={loading}>
            <div className={dash.toolbarSegment}>
              <DashboardTabBar
                tabs={[
                  { id: "table", label: "List", icon: <LayoutList className="h-3.5 w-3.5" /> },
                  { id: "grid", label: "Grid", icon: <Grid3X3 className="h-3.5 w-3.5" /> },
                ]}
                active={viewMode}
                onChange={(id) => setViewMode(id as "table" | "grid")}
              />
            </div>
            <div className={dash.toolbarSegment}>
              <span className={dash.muted}>
                <strong className="text-[var(--dash-accent)]">{total}</strong> post
                {total === 1 ? "" : "s"}
              </span>
            </div>
            {canWrite && (
              <>
                <div className={dash.toolbarSegment}>
                  <button
                    type="button"
                    onClick={() => setEditor({ page: null, isNew: true })}
                    className={`${dash.btn} ${dash.btnAccent} ${dash.btnDense}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add blog
                  </button>
                </div>
                {importable.length > 0 && (
                  <div className={dash.toolbarSegment}>
                    <button
                      ref={importBtnRef}
                      type="button"
                      disabled={busy === "import"}
                      onClick={() => setImportOpen((v) => !v)}
                      className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                      aria-expanded={importOpen}
                      aria-haspopup="menu"
                    >
                      {busy === "import" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Import
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <DashboardDropdownMenu
                      open={importOpen}
                      onClose={() => setImportOpen(false)}
                      anchorRef={importBtnRef}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setImportOpen(false);
                          void importFromSite();
                        }}
                      >
                        Import all ({importable.length})
                      </button>
                    </DashboardDropdownMenu>
                  </div>
                )}
              </>
            )}
          </DashboardListToolbar>
        }
        error={error}
        loading={loading && items.length === 0}
        loadingLabel="Loading blogs…"
      >
        <div className="blog-admin-filters">
          <DashboardFilterBar
            split
            meta={
              activeFilterCount > 0 ? (
                <>
                  <span style={{ color: "var(--dash-warning)" }}>{activeFilterCount}</span>{" "}
                  filter{activeFilterCount === 1 ? "" : "s"} active
                </>
              ) : null
            }
          >
            <div className="dash-filter-bar__search">
              <Search className={`h-3.5 w-3.5 ${dash.filterSearchIcon}`} aria-hidden />
              <input
                className={dash.inputCompact}
                placeholder="Search title, slug, author…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className={`${dash.inputCompact} ${dash.filterSelect}`}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABELS) as CmsPageStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              className={`${dash.inputCompact} ${dash.filterSelect}`}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {facets.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={`${dash.inputCompact} ${dash.filterSelect}`}
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All authors</option>
              {facets.authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              className={`${dash.inputCompact} ${dash.filterSelect}`}
              value={seoFilter}
              onChange={(e) => {
                setSeoFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">SEO score</option>
              <option value="good">Good (80+)</option>
              <option value="fair">Fair (50–79)</option>
              <option value="poor">Needs work (&lt;50)</option>
            </select>
            <div className={dash.filterActions}>
              <button
                type="button"
                className={`${dash.btn} ${dash.btnText} ${dash.btnDense} ${filtersOpen ? dash.btnAccent : ""}`}
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                More
                {activeFilterCount > 0 && !filtersOpen ? ` (${activeFilterCount})` : ""}
              </button>
            </div>
            <div className="blog-admin-chips">
              <button
                type="button"
                className={`blog-admin-chip ${featuredOnly ? "blog-admin-chip--on" : ""}`}
                onClick={() => {
                  setFeaturedOnly((v) => !v);
                  setPage(1);
                }}
              >
                <Star className="h-3 w-3" />
                Featured
              </button>
              <button
                type="button"
                className={`blog-admin-chip ${showTrashed ? "blog-admin-chip--on" : ""}`}
                onClick={() => {
                  setShowTrashed((v) => !v);
                  setPage(1);
                }}
              >
                <Trash2 className="h-3 w-3" />
                Trash
              </button>
            </div>
          </DashboardFilterBar>

          {filtersOpen && (
            <div className="blog-admin-filters__advanced">
              <select
                className={`${dash.inputCompact} ${dash.filterSelect}`}
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All tags</option>
                {facets.tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className={`${dash.inputCompact} ${dash.filterSelect}`}
                value={schemaFilter}
                onChange={(e) => {
                  setSchemaFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Schema type</option>
                <option value="article">Article</option>
                <option value="faq">FAQ</option>
                <option value="howTo">HowTo</option>
              </select>
              <input
                type="date"
                className={dash.inputCompact}
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                aria-label="From date"
              />
              <input
                type="date"
                className={dash.inputCompact}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                aria-label="To date"
              />
            </div>
          )}
        </div>

        {selected.size > 0 && canWrite && (
          <div className="blog-bulk-bar">
            <div className="blog-bulk-bar__summary">
              <span className="blog-bulk-bar__count">{selected.size}</span>
              <span className="blog-bulk-bar__label">selected</span>
            </div>
            <div className="blog-bulk-bar__groups">
              <div className="blog-bulk-bar__group" aria-label="Publish actions">
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("publish")}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("unpublish")}
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("archive")}
                >
                  Archive
                </button>
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("feature")}
                >
                  Feature
                </button>
              </div>
              <div className="blog-bulk-bar__group" aria-label="SEO actions">
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("set_noindex")}
                >
                  Set as noindex
                </button>
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                  onClick={() => void bulkAction("set_index")}
                >
                  Allow indexing
                </button>
              </div>
              <div className="blog-bulk-bar__group blog-bulk-bar__group--danger">
                <button
                  type="button"
                  className={`${dash.btn} ${dash.btnText} ${dash.btnDense} text-red-300`}
                  onClick={() =>
                    setConfirm({
                      title: "Move selected to trash?",
                      message: `${selected.size} post${selected.size === 1 ? "" : "s"} will move to trash for 30 days.`,
                      danger: true,
                      label: "Trash",
                      action: async () => bulkAction("delete"),
                    })
                  }
                >
                  Trash
                </button>
              </div>
            </div>
          </div>
        )}

        {featuredOnly && items.length > 1 && canWrite && (
          <p className={`${dash.muted} mb-3`}>
            Featured order: use row actions to feature/unfeature; drag-and-drop ordering coming next.
            <button
              type="button"
              className="ml-2 underline"
              onClick={() =>
                void dashboardFetch("/api/dashboard/blogs/featured-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    pageKeys: items
                      .filter((i) => i.meta.isFeatured)
                      .sort(
                        (a, b) =>
                          (a.meta.featuredOrder ?? 0) - (b.meta.featuredOrder ?? 0),
                      )
                      .map((i) => i.pageKey),
                  }),
                })
              }
            >
              Save current order
            </button>
          </p>
        )}

        {viewMode === "table" ? (
          <div className="blog-admin-table">
            <DataTable
            columns={columns}
            rows={items}
            rowKey={(r) => r.pageKey}
            emptyMessage="No blog posts match your filters."
            caption="Blog posts"
            stickyFirstColumn
            dense
            renderAfterRow={(r) =>
              expandedSeo.has(r.pageKey) ? (
                <div className="blog-seo-expand">
                  <BlogSeoIssueList issues={r.seoHealth.issues} />
                </div>
              ) : null
            }
            />
          </div>
        ) : (
          <div className="blog-grid">
            {items.map((r) => (
              <article key={r.pageKey} className="blog-grid-card">
                <div className="relative aspect-[16/10] bg-black/40">
                  {r.meta.image || r.meta.thumbnailImage ? (
                    <Image
                      src={r.meta.thumbnailImage || r.meta.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20 text-sm">
                      No image
                    </div>
                  )}
                  <div className="absolute left-2 top-2">
                    <BlogStatusBadge status={r.status} />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="truncate font-bold text-white">{displayTitleFromPage(r)}</h3>
                  <p className="mt-1 text-xs text-white/40">{r.meta.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <BlogSeoHealthBadge health={r.seoHealth} />
                    {canWrite && rowActions(r)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {total > 50 && (
          <div className="blog-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className={`${dash.btn} ${dash.btnText}`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page * 50 >= total}
              onClick={() => setPage((p) => p + 1)}
              className={`${dash.btn} ${dash.btnText}`}
            >
              Next
            </button>
          </div>
        )}
      </DashboardModuleFrame>

      {panel &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={dash.modalOverlay} onClick={() => setPanel(null)} role="presentation">
            <div
              className={`${dash.modalWide} dash-blog-panel-modal`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className={dash.modalBody}>
                <h3 className="font-philosopher text-xl text-white">{panel.title}</h3>
                <p className="text-sm text-white/40 capitalize">{panel.type}</p>
                <ul className="mt-4 space-y-2">
                  {panelData.map((entry, i) => {
                    const e = entry as {
                      updatedAt?: string;
                      createdAt?: string;
                      action?: string;
                      snapshot?: unknown;
                      metadata?: Record<string, unknown>;
                      userId?: { name?: string; email?: string };
                    };
                    const when = e.updatedAt ?? e.createdAt;
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 border border-white/10 bg-black/20 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-white/80">
                            {panel.type === "changelog"
                              ? String(e.action ?? "update")
                              : e.action ?? "save"}
                          </p>
                          <p className="text-xs text-white/40">
                            {fmtWhen(when)}
                            {e.userId?.name ? ` · ${e.userId.name}` : ""}
                          </p>
                        </div>
                        {panel.type === "versions" && canWrite && (
                          <button
                            type="button"
                            className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
                            onClick={() => void restoreVersion(panel.pageKey, i)}
                          >
                            Restore
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {editor && (
        <BlogEditorModal
          page={editor.page}
          isNew={editor.isNew}
          existingSlugs={existingSlugs}
          currentPageKey={editor.page?.pageKey}
          onClose={() => setEditor(null)}
        />
      )}

      <BlogConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.label}
        danger={confirm?.danger}
        busy={busy === "bulk"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          void confirm.action().then(() => setConfirm(null));
        }}
      />
    </>
  );
}
