"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { roleCanWrite, type Role } from "@/lib/auth/permissions";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import { BuildChoice } from "./BuildChoice";
import { ManualBuilder } from "./ManualBuilder";
import { HtmlBuilder } from "./HtmlBuilder";
import { DashboardPageFallback } from "@/components/dashboard/ui/DashboardPageFallback";
import type { BuilderPageData } from "./shared/saveBlog";

type BuildClientProps = {
  page: BuilderPageData;
  mode: string;
};

export function BuildClient({ page, mode }: BuildClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;
  const canWrite = role ? roleCanWrite("/dashboard/seo", role) : false;

  const [lockMsg, setLockMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!canWrite) {
      router.replace("/dashboard/seo/blogs");
    }
  }, [canWrite, status, router]);

  useEffect(() => {
    if (!canWrite || !session?.user) return;
    void dashboardFetch(`/api/dashboard/blogs/${encodeURIComponent(page.pageKey)}/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "acquire",
        userName: session.user.name ?? session.user.email ?? "Editor",
      }),
    }).then(async (res) => {
      const data = (await res.json()) as { locked?: boolean; by?: string };
      if (data.locked) {
        setLockMsg(`Currently being edited by ${data.by ?? "another user"}`);
      }
    });
    return () => {
      void dashboardFetch(`/api/dashboard/blogs/${encodeURIComponent(page.pageKey)}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release" }),
      });
    };
  }, [canWrite, page.pageKey, session?.user]);

  if (status === "loading" || !canWrite) {
    return <DashboardPageFallback label="Loading builder…" />;
  }

  if (mode === "manual") {
    return (
      <>
        {lockMsg && (
          <p className="border-b border-amber-400/30 bg-amber-400/10 px-6 py-2 text-sm text-amber-200">
            {lockMsg} — read-only conflict; save carefully or ask admin to take over.
          </p>
        )}
        <ManualBuilder page={page} />
      </>
    );
  }
  if (mode === "html") {
    return <HtmlBuilder page={page} />;
  }
  return <BuildChoice page={page} />;
}
