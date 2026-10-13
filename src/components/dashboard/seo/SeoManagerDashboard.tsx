"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

import { useSession } from "next-auth/react";

import { dashboardFetch, readDashboardApiError } from "@/lib/dashboard/dashboardFetch";

import { dash } from "@/lib/dashboard/dashboardClasses";

import { roleCanWrite, type Role } from "@/lib/auth/permissions";

import { DashboardListToolbar } from "../ui/DashboardListToolbar";

import { DashboardFilterBar } from "../ui/DashboardFilterBar";

import { DashboardModuleFrame } from "../ui/DashboardModuleFrame";

import { DashboardTabBar } from "../ui/DashboardTabBar";

import { SeoHealthOverview } from "./SeoHealthOverview";

import { SeoIssuesGrouped } from "./SeoIssuesGrouped";

import { validateRobotsTxt, type SeoIssueView } from "@/lib/seo/issuePresentation";

import type { AuditedPage } from "@/lib/seo/seoAudit";

import "@/styles/seo-manager.css";



type HealthReport = {

  generatedAt: string;

  seoHealthScore: number;

  contentHealthScore: number;

  mediaHealthScore: number;

  redirectHealthScore: number;

  schemaHealthScore: number;

  summary: {

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

  issues: SeoIssueView[];

  pages?: AuditedPage[];

};



export function SeoManagerDashboard() {

  const { data: session } = useSession();

  const role = session?.user?.role as Role | undefined;

  const canWrite = role ? roleCanWrite("/dashboard/seo/manager", role) : false;



  const [report, setReport] = useState<HealthReport | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<"overview" | "issues" | "robots">("overview");

  const [robots, setRobots] = useState("");

  const [robotsDefault, setRobotsDefault] = useState("");

  const [robotsDirty, setRobotsDirty] = useState(false);

  const [savingRobots, setSavingRobots] = useState(false);

  const [robotsErrors, setRobotsErrors] = useState<string[]>([]);



  const load = useCallback(async () => {

    setLoading(true);

    setError(null);

    try {

      const res = await dashboardFetch("/api/dashboard/seo/manager?refresh=1");

      if (!res.ok) throw new Error(await readDashboardApiError(res, "Failed to load SEO report"));

      const data = (await res.json()) as { report?: HealthReport };

      setReport(data.report ?? null);

    } catch (e) {

      setError(e instanceof Error ? e.message : "Failed to load");

    } finally {

      setLoading(false);

    }

  }, []);



  const loadRobots = useCallback(async () => {
    const res = await dashboardFetch("/api/dashboard/seo/robots");
    if (!res.ok) {
      setError(await readDashboardApiError(res, "Failed to load robots.txt"));
      return;
    }
    const data = (await res.json()) as { content?: string; defaultContent?: string };
    setRobots(data.content ?? "");
    setRobotsDefault(data.defaultContent ?? "");
    setRobotsDirty(false);
    setRobotsErrors([]);
  }, []);



  useEffect(() => {

    void load();

    void loadRobots();

  }, [load, loadRobots]);



  const pageScores = useMemo(() => {

    const map = new Map<string, number>();

    for (const p of report?.pages ?? []) {

      map.set(p.contentId, p.score);

    }

    return map;

  }, [report?.pages]);



  const saveRobots = async () => {

    const validation = validateRobotsTxt(robots);

    setRobotsErrors(validation);

    if (validation.length) return;



    setSavingRobots(true);

    try {

      const res = await dashboardFetch("/api/dashboard/seo/robots", {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ content: robots }),

      });

      if (!res.ok) throw new Error("Save failed");

      setRobotsDirty(false);

    } catch (e) {

      setError(e instanceof Error ? e.message : "Save failed");

    } finally {

      setSavingRobots(false);

    }

  };



  return (

    <DashboardModuleFrame

      toolbar={

        <DashboardListToolbar

          meta={

            report

              ? `Audited ${new Date(report.generatedAt).toLocaleString("en-IN")}`

              : "SEO command center"

          }

          onRefresh={load}

          refreshing={loading}

        />

      }

      note={

        <DashboardFilterBar compact className="seo-manager__tabs">

          <DashboardTabBar

            tabs={[

              { id: "overview", label: "Overview" },

              {

                id: "issues",

                label: "Issues",

                count:

                  report && report.summary.openIssues > 0

                    ? report.summary.openIssues

                    : undefined,

              },

              { id: "robots", label: "Robots" },

            ]}

            active={tab}

            onChange={(id) => setTab(id as "overview" | "issues" | "robots")}

          />

        </DashboardFilterBar>

      }

      error={error}

      loading={loading && !report}

      loadingLabel="Running site SEO audit…"

    >

      {tab === "overview" && report && (

        <SeoHealthOverview

          seoHealthScore={report.seoHealthScore}

          contentHealthScore={report.contentHealthScore}

          mediaHealthScore={report.mediaHealthScore}

          redirectHealthScore={report.redirectHealthScore}

          schemaHealthScore={report.schemaHealthScore}

          summary={report.summary}

          onViewIssues={() => setTab("issues")}

        />

      )}



      {tab === "issues" && report && (

        <SeoIssuesGrouped issues={report.issues} pageScores={pageScores} />

      )}



      {tab === "robots" && (

        <div className="seo-robots">

          <p className={dash.muted}>

            Edit robots.txt override. Validation runs before save.

          </p>

          <textarea

            className={`${dash.input} seo-robots__editor`}

            value={robots}

            onChange={(e) => {

              setRobots(e.target.value);

              setRobotsDirty(true);

              setRobotsErrors(validateRobotsTxt(e.target.value));

            }}

            disabled={!canWrite}

            spellCheck={false}

          />

          {robotsErrors.length > 0 && (

            <ul className="seo-robots__errors">

              {robotsErrors.map((msg) => (

                <li key={msg}>

                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />

                  {msg}

                </li>

              ))}

            </ul>

          )}

          <div className="seo-robots__actions">

            {canWrite && (

              <button

                type="button"

                disabled={!robotsDirty || savingRobots || robotsErrors.length > 0}

                onClick={() => void saveRobots()}

                className={`${dash.btn} ${dash.btnAccent}`}

              >

                {savingRobots ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save robots.txt"}

              </button>

            )}

            {canWrite && (

              <button

                type="button"

                onClick={() => {

                  setRobots(robotsDefault);

                  setRobotsDirty(true);

                  setRobotsErrors(validateRobotsTxt(robotsDefault));

                }}

                className={`${dash.btn} ${dash.btnText}`}

              >

                <RefreshCw className="h-4 w-4" />

                Restore defaults

              </button>

            )}

          </div>

          {!canWrite && (

            <p className="seo-robots__readonly">

              <AlertTriangle className="h-4 w-4" />

              Read-only — SEO Manager or Admin role required to edit.

            </p>

          )}

        </div>

      )}

    </DashboardModuleFrame>

  );

}

