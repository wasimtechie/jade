"use client";



import { useMemo, useState } from "react";

import Link from "next/link";

import {

  ChevronDown,

  ChevronRight,

  ExternalLink,

  Search,

} from "lucide-react";

import { dash } from "@/lib/dashboard/dashboardClasses";

import {

  CATEGORY_META,

  CONTENT_TYPE_LABEL,

  fixHintForIssue,

  groupIssuesByContent,

  PRIORITY_META,

  scoreTone,

  type SeoIssueView,

} from "@/lib/seo/issuePresentation";

import type { SeoContentType, SeoIssuePriority } from "@/lib/seo/seoAudit";



type Props = {

  issues: SeoIssueView[];

  pageScores?: Map<string, number>;

};



export function SeoIssuesGrouped({ issues, pageScores }: Props) {

  const [q, setQ] = useState("");

  const [priority, setPriority] = useState<"" | SeoIssuePriority>("");

  const [contentType, setContentType] = useState<"" | SeoContentType>("");

  const [expanded, setExpanded] = useState<Set<string>>(new Set());



  const filtered = useMemo(() => {

    const query = q.trim().toLowerCase();

    return issues.filter((i) => {

      if (priority && i.priority !== priority) return false;

      if (contentType && i.contentType !== contentType) return false;

      if (!query) return true;

      return (

        i.contentName.toLowerCase().includes(query) ||

        i.issueType.toLowerCase().includes(query) ||

        i.category.toLowerCase().includes(query)

      );

    });

  }, [issues, q, priority, contentType]);



  const groups = useMemo(

    () => groupIssuesByContent(filtered, pageScores),

    [filtered, pageScores],

  );



  const toggle = (key: string) => {

    setExpanded((prev) => {

      const next = new Set(prev);

      if (next.has(key)) next.delete(key);

      else next.add(key);

      return next;

    });

  };



  const expandAll = () => setExpanded(new Set(groups.map((g) => g.key)));

  const collapseAll = () => setExpanded(new Set());



  const contentTypes = useMemo(() => {

    const set = new Set(issues.map((i) => i.contentType));

    return Array.from(set).sort();

  }, [issues]);



  return (

    <div className="seo-issues">

      <div className="seo-issues__toolbar">

        <div className="seo-issues__search">

          <Search className="h-3.5 w-3.5 text-white/30" aria-hidden />

          <input

            className={`${dash.inputCompact} seo-issues__input`}

            placeholder="Search content or issue…"

            value={q}

            onChange={(e) => setQ(e.target.value)}

          />

        </div>

        <select

          className={`${dash.inputCompact} seo-issues__select`}

          value={priority}

          onChange={(e) => setPriority(e.target.value as "" | SeoIssuePriority)}

        >

          <option value="">All priorities</option>

          <option value="high">High</option>

          <option value="medium">Medium</option>

          <option value="low">Low</option>

        </select>

        <select

          className={`${dash.inputCompact} seo-issues__select`}

          value={contentType}

          onChange={(e) => setContentType(e.target.value as "" | SeoContentType)}

        >

          <option value="">All types</option>

          {contentTypes.map((t) => (

            <option key={t} value={t}>

              {CONTENT_TYPE_LABEL[t]}

            </option>

          ))}

        </select>

        <div className="seo-issues__toolbar-actions">

          <button

            type="button"

            className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}

            onClick={expandAll}

          >

            Expand

          </button>

          <button

            type="button"

            className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}

            onClick={collapseAll}

          >

            Collapse

          </button>

        </div>

        <p className="seo-issues__summary">

          <span className="seo-issues__count">{groups.length}</span> items ·{" "}

          <span className="seo-issues__count">{filtered.length}</span> issues

        </p>

      </div>



      {groups.length === 0 ? (

        <div className="seo-issues__empty">

          <p className="text-white/80">No SEO issues found — great work!</p>

          <p className={dash.muted}>Try clearing filters if you expected results.</p>

        </div>

      ) : (

        <ul className="seo-issues__list">

          {groups.map((group) => {

            const isOpen = expanded.has(group.key);

            const pr = PRIORITY_META[group.highestPriority];

            const score =

              group.score ??

              pageScores?.get(group.contentId) ??

              pageScores?.get(group.key);

            const scoreClass = score != null ? scoreTone(score) : null;



            return (

              <li

                key={group.key}

                className={`seo-issue-group seo-issue-group--${pr.tone}`}

              >

                <button

                  type="button"

                  className="seo-issue-group__header"

                  onClick={() => toggle(group.key)}

                  aria-expanded={isOpen}

                >

                  <span className="seo-issue-group__chevron">

                    {isOpen ? (

                      <ChevronDown className="h-3.5 w-3.5" />

                    ) : (

                      <ChevronRight className="h-3.5 w-3.5" />

                    )}

                  </span>

                  <span className={`seo-type-badge seo-type-badge--${group.contentType}`}>

                    {CONTENT_TYPE_LABEL[group.contentType]}

                  </span>

                  <span className="seo-issue-group__name">{group.contentName}</span>

                  <span className="seo-issue-group__meta">

                    <span className={`seo-priority-badge seo-priority-badge--${pr.tone}`}>

                      {group.issues.length} · {pr.label}

                    </span>

                    {scoreClass && score != null && (

                      <span className={`seo-mini-score seo-mini-score--${scoreClass}`}>

                        {score}%

                      </span>

                    )}

                    <span className="seo-issue-group__date">

                      {group.lastModified?.slice(0, 10) ?? "—"}

                    </span>

                    <Link

                      href={group.fixHref}

                      className={`${dash.btn} ${dash.btnText} ${dash.btnDense} seo-issue-group__fix`}

                      onClick={(e) => e.stopPropagation()}

                    >

                      Fix

                      <ExternalLink className="h-3 w-3" />

                    </Link>

                  </span>

                </button>



                {isOpen && (

                  <ul className="seo-issue-group__body">

                    {group.issues.map((issue) => {

                      const cat = CATEGORY_META[issue.category];

                      const ip = PRIORITY_META[issue.priority];

                      return (

                        <li key={issue.id} className="seo-issue-row">

                          <span className={`seo-cat-badge seo-cat-badge--${cat.tone}`}>

                            {cat.label}

                          </span>

                          <span className={`seo-priority-dot seo-priority-dot--${ip.tone}`} />

                          <div className="seo-issue-row__main">

                            <p className="seo-issue-row__title">{issue.issueType}</p>

                            <p className="seo-issue-row__hint">{fixHintForIssue(issue)}</p>

                          </div>

                          <Link

                            href={issue.fixHref}

                            className={`${dash.btn} ${dash.btnText} ${dash.btnDense} seo-issue-row__link`}

                          >

                            Open

                          </Link>

                        </li>

                      );

                    })}

                  </ul>

                )}

              </li>

            );

          })}

        </ul>

      )}

    </div>

  );

}

