"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { scoreTone } from "@/lib/seo/issuePresentation";

type Summary = {
  totalIndexedPages: number;
  totalPublishedPages: number;
  missingMetaTitles: number;
  missingMetaDescriptions: number;
  missingOgImages: number;
  missingAltText: number;
  missingSchema: number;
  brokenRedirects: number;
  duplicateSlugs: number;
  openIssues: number;
};

type Props = {
  seoHealthScore: number;
  contentHealthScore: number;
  mediaHealthScore: number;
  redirectHealthScore: number;
  schemaHealthScore: number;
  summary: Summary;
  onViewIssues: () => void;
};

function ScorePill({ label, score }: { label: string; score: number }) {
  const tone = scoreTone(score);
  return (
    <div className={`seo-pill seo-pill--${tone}`}>
      <span className="seo-pill__label">{label}</span>
      <span className="seo-pill__value">{score}%</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  warnAbove = 0,
}: {
  label: string;
  value: number;
  warnAbove?: number;
}) {
  const tone =
    value === 0 ? "ok" : value <= warnAbove ? "warn" : "bad";
  return (
    <div className={`seo-stat-tile seo-stat-tile--${tone}`}>
      <span className="seo-stat-tile__value">{value}</span>
      <span className="seo-stat-tile__label">{label}</span>
    </div>
  );
}

function HealthRing({ score }: { score: number }) {
  const tone = scoreTone(score);
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className={`seo-ring seo-ring--${tone}`}>
      <svg viewBox="0 0 100 100" className="seo-ring__svg" aria-hidden>
        <circle className="seo-ring__track" cx="50" cy="50" r={r} />
        <circle
          className="seo-ring__fill"
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="seo-ring__center">
        <span className="seo-ring__value">{score}%</span>
        <span className="seo-ring__label">Health</span>
      </div>
    </div>
  );
}

export function SeoHealthOverview({
  seoHealthScore,
  contentHealthScore,
  mediaHealthScore,
  redirectHealthScore,
  schemaHealthScore,
  summary,
  onViewIssues,
}: Props) {
  const s = summary;

  return (
    <div className="seo-overview">
      <div className="seo-overview__hero">
        <HealthRing score={seoHealthScore} />
        <div className="seo-overview__scores">
          <p className="seo-overview__eyebrow">Site SEO breakdown</p>
          <div className="seo-pill-row">
            <ScorePill label="Content" score={contentHealthScore} />
            <ScorePill label="Media" score={mediaHealthScore} />
            <ScorePill label="Redirects" score={redirectHealthScore} />
            <ScorePill label="Schema" score={schemaHealthScore} />
          </div>
          {s.openIssues > 0 ? (
            <button
              type="button"
              onClick={onViewIssues}
              className="seo-overview__cta"
            >
              {s.openIssues} open issue{s.openIssues === 1 ? "" : "s"} — review
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <p className="seo-overview__all-clear">
              <CheckCircle2 className="h-4 w-4" />
              All checks passed
            </p>
          )}
        </div>
      </div>

      <div className="seo-stat-tiles">
        <StatTile label="Indexed" value={s.totalIndexedPages} warnAbove={999} />
        <StatTile label="Published" value={s.totalPublishedPages} warnAbove={999} />
        <StatTile label="Missing titles" value={s.missingMetaTitles} />
        <StatTile label="Missing descriptions" value={s.missingMetaDescriptions} />
        <StatTile label="Missing OG images" value={s.missingOgImages} />
        <StatTile label="Missing alt" value={s.missingAltText} />
        <StatTile label="Schema gaps" value={s.missingSchema} />
        <StatTile label="Broken redirects" value={s.brokenRedirects} />
        <StatTile label="Duplicate slugs" value={s.duplicateSlugs} />
        <StatTile label="Open issues" value={s.openIssues} />
      </div>

      <div className="seo-quick-links">
        <Link href="/dashboard/seo/redirects" className={`${dash.btn} ${dash.btnText} seo-quick-links__btn`}>
          Redirects
        </Link>
        <Link href="/dashboard/seo/sitemap" className={`${dash.btn} ${dash.btnText} seo-quick-links__btn`}>
          Sitemap
        </Link>
        <Link href="/dashboard/media" className={`${dash.btn} ${dash.btnText} seo-quick-links__btn`}>
          Media alt
        </Link>
        <button
          type="button"
          onClick={onViewIssues}
          className={`${dash.btn} ${dash.btnAccent} seo-quick-links__btn`}
        >
          All issues
        </button>
      </div>

      <p className={`${dash.muted} seo-overview__note`}>
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        Search Console / Analytics integrations — architecture ready, not connected yet.
      </p>
    </div>
  );
}
