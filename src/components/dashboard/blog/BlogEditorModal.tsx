"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  BLOG_SCHEMA_IDS,
  BLOG_SCHEMA_LABELS,
  buildPageUrl,
  defaultCanonicalUrl,
  hasBuiltSections,
  inferBuilderMode,
  legacyAdvancedFromSchemas,
  normalizeBlogMeta,
  resolvePageStatus,
  slugifyTitle,
  type CmsBlogMeta,
  type CmsBlogSchemas,
  type CmsBlogSection,
  type CmsBlogSeo,
  type CmsPageStatus,
} from "@/lib/cms/blogCms";
import { STATUS_LABELS } from "@/lib/cms/blogWorkflow";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { dash } from "@/lib/dashboard/dashboardClasses";
import {
  useDashboardForm,
  validateBlogEditor,
} from "@/lib/dashboard/dashboardFormValidation";
import { DashFloatingField } from "@/components/dashboard/form";
import { DashboardModalHeader } from "@/components/dashboard/ui/DashboardModalHeader";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import { BlogSeoPreviews } from "./BlogSeoPreviews";
import { BlogFaqEditor } from "./BlogFaqEditor";
import { RedirectSuggestModal } from "@/components/dashboard/seo/RedirectSuggestModal";

const STEPS = ["details", "seo", "schema", "faq"] as const;
type WizardStep = (typeof STEPS)[number];

const STEP_LABELS: Record<WizardStep, string> = {
  details: "Details",
  seo: "SEO",
  schema: "Schema",
  faq: "FAQ",
};

type BlogPage = {
  pageKey: string;
  status: CmsPageStatus;
  meta?: CmsBlogMeta | null;
  sections: CmsBlogSection[];
};

type BlogEditorModalProps = {
  page: BlogPage | null;
  isNew: boolean;
  existingSlugs: Set<string>;
  currentPageKey?: string;
  onClose: () => void;
};

function CharCounter({
  value,
  ideal,
  max,
}: {
  value: number;
  ideal: number;
  max: number;
}) {
  const tone =
    value > max
      ? "text-red-400"
      : value > ideal
        ? "text-amber-300"
        : "text-white/40";
  return (
    <p className={`${dash.muted} mt-1 ${tone}`}>
      {value} / {ideal} recommended (max {max})
    </p>
  );
}

export function BlogEditorModal({
  page,
  isNew,
  existingSlugs,
  currentPageKey,
  onClose,
}: BlogEditorModalProps) {
  const router = useRouter();
  const [meta, setMeta] = useState<CmsBlogMeta>(() =>
    normalizeBlogMeta(page?.meta),
  );
  const [pageStatus, setPageStatus] = useState<CmsPageStatus>(
    page?.status ?? "draft",
  );
  const [step, setStep] = useState<WizardStep>("details");
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [redirectSuggest, setRedirectSuggest] = useState<{
    fromPath: string;
    toPath: string;
  } | null>(null);
  const originalSlug = page?.meta?.slug ?? page?.pageKey.replace(/^blog\//, "") ?? "";

  const {
    fieldErrors,
    showFieldError,
    touch,
    validateField,
    runSubmit,
  } = useDashboardForm({
    validate: validateBlogEditor,
  });

  const getEditorValues = () => ({
    title: meta.title,
    slug: meta.slug.trim() || slugifyTitle(meta.title),
  });

  const blurEditorField = (key: "title" | "slug") => {
    touch(key);
    validateField(key, getEditorValues());
  };

  const continueBuilding = !isNew && hasBuiltSections(page?.sections);
  const stepIndex = STEPS.indexOf(step);
  const uploadSlug = `blog/${meta.slug || slugifyTitle(meta.title) || "draft"}`;

  const seo = meta.seo ?? {};
  const schemas = meta.schemas ?? {
    article: true,
    faq: false,
    howTo: false,
    breadcrumb: true,
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pageKey = useMemo(
    () => `blog/${meta.slug || slugifyTitle(meta.title) || "untitled"}`,
    [meta.slug, meta.title],
  );

  const updateMeta = <K extends keyof CmsBlogMeta>(
    key: K,
    value: CmsBlogMeta[K],
  ) => {
    setMeta((m) => {
      const next = { ...m, [key]: value };
      if (key === "title" && isNew && !slugTouched) {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
  };

  const updateSeo = (patch: Partial<CmsBlogSeo>) => {
    setMeta((m) => ({
      ...m,
      seo: { ...m.seo, ...patch },
    }));
  };

  const updateSchemas = (patch: Partial<CmsBlogSchemas>) => {
    setMeta((m) => {
      const nextSchemas = { ...(m.schemas ?? schemas), ...patch };
      return {
        ...m,
        schemas: nextSchemas,
        advancedSchema: legacyAdvancedFromSchemas(nextSchemas, m.faqs),
      };
    });
  };

  const validateDetailsExtras = (): string | null => {
    if (!meta.category.trim()) return "Category is required";
    const slug = getEditorValues().slug;
    if (
      existingSlugs.has(slug.toLowerCase()) &&
      currentPageKey !== `blog/${slug}`
    ) {
      return `Slug "${slug}" is already in use`;
    }
    return null;
  };

  const validateDetails = (): boolean => {
    if (!runSubmit(getEditorValues())) return false;
    const extra = validateDetailsExtras();
    if (extra) {
      setError(extra);
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    setWarn(null);
    if (step === "details") {
      if (!validateDetails()) return;
      if (!meta.image.trim()) {
        setWarn("Featured image is recommended for blog cards and social sharing.");
      }
    }
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    setError(null);
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const finish = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!validateDetails()) {
      setStep("details");
      return;
    }

    const slug = meta.slug.trim() || slugifyTitle(meta.title);
    const today = new Date().toISOString().slice(0, 10);
    const normalized = normalizeBlogMeta({
      ...meta,
      slug,
      dateModified: meta.dateModified || today,
      seo: {
        ...meta.seo,
        canonicalUrl:
          meta.seo?.canonicalUrl?.trim() || defaultCanonicalUrl(slug),
      },
    });

    const resolvedStatus = resolvePageStatus(
      pageStatus,
      normalized.publishedAt,
      normalized.scheduledPublishAt,
    );

    setSaving(true);
    setError(null);
    try {
      const finalKey = `blog/${slug}`;
      const payload = {
        pageKey: finalKey,
        meta: normalized,
        status: resolvedStatus,
        ...(isNew ? { sections: page?.sections ?? [] } : {}),
      };
      const res = await dashboardFetch("/api/dashboard/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Save failed");
      }
      if (!isNew && originalSlug && slug !== originalSlug) {
        setRedirectSuggest({
          fromPath: `/${originalSlug}/`,
          toPath: `/${slug}/`,
        });
      } else {
        const mode = continueBuilding
          ? inferBuilderMode(page?.sections)
          : "choose";
        router.push(buildPageUrl(finalKey, mode));
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={dash.modalOverlay} onClick={onClose}>
      <div
        className={`${GLASS_CHROME_FRAME_CLASS} ${dash.modalWide}`}
        style={{ maxWidth: "52rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-px block ${GLASS_INNER_SURFACE}`}
        />
        <form
          onSubmit={step === "faq" ? finish : (e) => e.preventDefault()}
          className={`${dash.modalFrame} flex min-h-0 flex-col`}
        >
          <DashboardModalHeader
            section="Blog CMS"
            title={isNew ? "Add blog post" : "Edit blog post"}
            description={pageKey}
            onClose={onClose}
            actions={
            <nav
              className="flex max-w-full flex-wrap gap-1"
              aria-label="Onboarding steps"
            >
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => i <= stepIndex && setStep(s)}
                  disabled={i > stepIndex}
                  className={`min-h-[var(--dash-control-h)] px-3 font-manrope text-xs font-bold uppercase tracking-wider ${
                    step === s
                      ? "bg-[var(--dash-accent-muted)] text-[var(--dash-accent)]"
                      : i < stepIndex
                        ? "text-white/70 hover:text-white"
                        : "text-white/30"
                  }`}
                >
                  {STEP_LABELS[s]}
                </button>
              ))}
            </nav>
            }
          />
          <div className={`${dash.modalBody} ${dash.stack}`}>
          {step === "details" && (
            <div className={dash.stack}>
              <DashFloatingField
                id="title"
                label="Blog title"
                value={meta.title}
                onChange={(value) => updateMeta("title", value)}
                onBlur={() => blurEditorField("title")}
                invalid={Boolean(fieldErrors.title)}
                showError={showFieldError("title")}
                errorMessage={fieldErrors.title}
                required
              />
              <div className={dash.formGrid2}>
                <DashFloatingField
                  id="slug"
                  label="Slug"
                  value={meta.slug}
                  onChange={(value) => {
                    setSlugTouched(true);
                    updateMeta("slug", slugifyTitle(value));
                  }}
                  onBlur={() => blurEditorField("slug")}
                  invalid={Boolean(fieldErrors.slug)}
                  showError={showFieldError("slug")}
                  errorMessage={fieldErrors.slug}
                  required
                  className="font-mono"
                />
                <div>
                  <label className={dash.label}>Category *</label>
                  <input
                    className={`${dash.input} w-full`}
                    value={meta.category}
                    onChange={(e) => updateMeta("category", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={dash.label}>Excerpt / short description</label>
                <textarea
                  className={`${dash.input} min-h-[72px] w-full`}
                  value={meta.excerpt}
                  onChange={(e) => updateMeta("excerpt", e.target.value)}
                />
              </div>
              <div className={dash.formGrid2}>
                <div>
                  <label className={dash.label}>Author</label>
                  <input
                    className={`${dash.input} w-full`}
                    value={meta.author}
                    onChange={(e) => updateMeta("author", e.target.value)}
                  />
                </div>
                <div>
                  <label className={dash.label}>Read time</label>
                  <input
                    className={`${dash.input} w-full`}
                    value={meta.readTime}
                    onChange={(e) => updateMeta("readTime", e.target.value)}
                  />
                </div>
              </div>
              <ImageUploadField
                label="Featured image (hero)"
                hint="Recommended for cards, hero, and Open Graph fallbacks."
                value={meta.image}
                onChange={(url) => updateMeta("image", url)}
                villaSlug={uploadSlug}
              />
              <ImageUploadField
                label="Blog thumbnail (optional)"
                hint="Used on blog index cards when set; otherwise the featured image is used."
                value={meta.thumbnailImage ?? ""}
                onChange={(url) => updateMeta("thumbnailImage", url || undefined)}
                villaSlug={uploadSlug}
              />
              <div>
                <label className={dash.label}>Tags (comma-separated)</label>
                <input
                  className={`${dash.input} w-full`}
                  value={meta.tags.join(", ")}
                  onChange={(e) =>
                    updateMeta(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={meta.isFeatured ?? false}
                  onChange={(e) => updateMeta("isFeatured", e.target.checked)}
                />
                Featured on blog index
              </label>
              <div className={dash.formGrid2}>
                <div>
                  <label className={dash.label}>Status</label>
                  <select
                    className={`${dash.input} w-full`}
                    value={pageStatus}
                    onChange={(e) =>
                      setPageStatus(e.target.value as CmsPageStatus)
                    }
                  >
                    {(Object.keys(STATUS_LABELS) as CmsPageStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={dash.label}>Publish date</label>
                  <input
                    type="date"
                    className={`${dash.input} w-full`}
                    value={meta.publishedAt?.slice(0, 10) ?? ""}
                    onChange={(e) => updateMeta("publishedAt", e.target.value)}
                  />
                </div>
              </div>
              {pageStatus === "scheduled" && (
                <div>
                  <label className={dash.label}>Schedule publish (date & time)</label>
                  <input
                    type="datetime-local"
                    className={`${dash.input} w-full`}
                    value={
                      meta.scheduledPublishAt
                        ? meta.scheduledPublishAt.slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      updateMeta(
                        "scheduledPublishAt",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      )
                    }
                  />
                </div>
              )}
              <div>
                <label className={dash.label}>Internal notes</label>
                <textarea
                  className={`${dash.input} min-h-[80px] w-full`}
                  placeholder="Team-only notes — never shown on the public site."
                  value={meta.internalNotes ?? ""}
                  onChange={(e) => updateMeta("internalNotes", e.target.value)}
                />
              </div>
              <div>
                <label className={dash.label}>Last modified date</label>
                <input
                  type="date"
                  className={`${dash.input} w-full`}
                  value={meta.dateModified?.slice(0, 10) ?? ""}
                  onChange={(e) =>
                    updateMeta("dateModified", e.target.value || undefined)
                  }
                />
                <p className={`${dash.muted} mt-1`}>
                  Auto-updated on save if left empty.
                </p>
              </div>
            </div>
          )}

          {step === "seo" && (
            <div className={dash.stack}>
              <div>
                <label className={dash.label}>Meta title</label>
                <input
                  className={`${dash.input} w-full`}
                  value={seo.metaTitle ?? ""}
                  onChange={(e) => updateSeo({ metaTitle: e.target.value })}
                  maxLength={120}
                  placeholder={meta.title || "Defaults to blog title"}
                />
                <CharCounter
                  value={(seo.metaTitle ?? meta.title).length}
                  ideal={60}
                  max={120}
                />
              </div>
              <div>
                <label className={dash.label}>Meta description</label>
                <textarea
                  className={`${dash.input} min-h-[88px] w-full`}
                  value={meta.description}
                  onChange={(e) => updateMeta("description", e.target.value)}
                  maxLength={320}
                />
                <CharCounter
                  value={meta.description.length}
                  ideal={160}
                  max={320}
                />
              </div>
              <div className={dash.formGrid2}>
                <div>
                  <label className={dash.label}>Focus keyword</label>
                  <input
                    className={`${dash.input} w-full`}
                    value={seo.focusKeyword ?? ""}
                    onChange={(e) =>
                      updateSeo({ focusKeyword: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={dash.label}>Canonical URL</label>
                  <input
                    className={`${dash.input} w-full font-mono text-sm`}
                    value={
                      seo.canonicalUrl ??
                      defaultCanonicalUrl(meta.slug || "your-slug")
                    }
                    onChange={(e) =>
                      updateSeo({ canonicalUrl: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="mb-3 font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)]">
                  Open Graph
                </p>
                <div className={dash.stack}>
                  <div>
                    <label className={dash.label}>OG title</label>
                    <input
                      className={`${dash.input} w-full`}
                      value={seo.ogTitle ?? ""}
                      onChange={(e) => updateSeo({ ogTitle: e.target.value })}
                      placeholder="Defaults to meta title"
                    />
                  </div>
                  <div>
                    <label className={dash.label}>OG description</label>
                    <textarea
                      className={`${dash.input} min-h-[72px] w-full`}
                      value={seo.ogDescription ?? ""}
                      onChange={(e) =>
                        updateSeo({ ogDescription: e.target.value })
                      }
                      placeholder="Defaults to meta description"
                    />
                  </div>
                  <ImageUploadField
                    label="OG image"
                    hint="Defaults to featured image when empty."
                    value={seo.ogImage ?? ""}
                    onChange={(url) => updateSeo({ ogImage: url || undefined })}
                    villaSlug={uploadSlug}
                  />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="mb-3 font-manrope text-xs font-bold uppercase tracking-widest text-[var(--dash-accent)]">
                  Search engine controls
                </p>
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={seo.robotsIndex !== false}
                      onChange={(e) =>
                        updateSeo({ robotsIndex: e.target.checked })
                      }
                    />
                    Index (allow search engines)
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={seo.robotsFollow !== false}
                      onChange={(e) =>
                        updateSeo({ robotsFollow: e.target.checked })
                      }
                    />
                    Follow links
                  </label>
                </div>
              </div>
              <BlogSeoPreviews
                slug={meta.slug}
                metaTitle={seo.metaTitle || meta.title}
                metaDescription={meta.description || meta.excerpt}
                ogTitle={seo.ogTitle || seo.metaTitle || meta.title}
                ogDescription={
                  seo.ogDescription || meta.description || meta.excerpt
                }
                ogImage={seo.ogImage ?? ""}
                fallbackImage={meta.image}
              />
            </div>
          )}

          {step === "schema" && (
            <div className={dash.stack}>
              <p className="font-manrope text-sm text-white/55">
                Select one or more structured data types for this post. You can
                combine Article, FAQ, HowTo, and Breadcrumb.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {BLOG_SCHEMA_IDS.map((id) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 border border-white/10 bg-black/20 px-4 py-3 hover:border-[var(--dash-accent-border)]"
                  >
                    <input
                      type="checkbox"
                      checked={schemas[id]}
                      onChange={(e) =>
                        updateSchemas({ [id]: e.target.checked })
                      }
                    />
                    <span className="font-manrope text-sm text-white/85">
                      {BLOG_SCHEMA_LABELS[id]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === "faq" && (
            <BlogFaqEditor
              faqs={meta.faqs ?? []}
              faqSchemaEnabled={schemas.faq}
              onChange={(faqs) => {
                setMeta((m) => {
                  const nextSchemas = m.schemas ?? schemas;
                  return {
                    ...m,
                    faqs,
                    advancedSchema: legacyAdvancedFromSchemas(
                      nextSchemas,
                      faqs,
                    ),
                  };
                });
              }}
            />
          )}

          {warn && <p className="text-sm text-amber-300/90">{warn}</p>}
          {error && <p className={dash.errorText}>{error}</p>}

          <div className="flex flex-wrap gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className={`${dash.btn} ${dash.btnText}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {step !== "faq" ? (
              <button
                type="button"
                onClick={goNext}
                className={`${dash.btn} ${dash.btnAccent}`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className={`${dash.btn} ${dash.btnAccent}`}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : continueBuilding ? (
                  "Continue building"
                ) : (
                  "Open builder"
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${dash.btn} ${dash.btnText}`}
            >
              Cancel
            </button>
          </div>
          </div>
        </form>
      </div>
      <RedirectSuggestModal
        open={!!redirectSuggest}
        fromPath={redirectSuggest?.fromPath ?? ""}
        toPath={redirectSuggest?.toPath ?? ""}
        onClose={() => {
          const slug = meta.slug.trim() || slugifyTitle(meta.title);
          const finalKey = `blog/${slug}`;
          const mode = continueBuilding
            ? inferBuilderMode(page?.sections)
            : "choose";
          setRedirectSuggest(null);
          router.push(buildPageUrl(finalKey, mode));
          onClose();
        }}
      />
    </div>
  );
}
