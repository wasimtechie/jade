"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CmsBlogSection } from "@/lib/cms/blogCms";
import { saveBlogDraft } from "@/app/dashboard/seo/blogs/build/[pageKey]/shared/saveBlog";
import type { BuilderPageData } from "@/app/dashboard/seo/blogs/build/[pageKey]/shared/saveBlog";

export type SaveStatus = "saved" | "saving" | "unsaved";

const RECOVERY_PREFIX = "jade-blog-editor-recovery:";

type RecoveryPayload = {
  sections: CmsBlogSection[];
  savedAt: string;
};

export function useEditorPersistence(
  page: BuilderPageData,
  sections: CmsBlogSection[],
  dirty: boolean,
  onRecover: (sections: CmsBlogSection[]) => void,
) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const recoveryKey = `${RECOVERY_PREFIX}${page.pageKey}`;
  const savingRef = useRef(false);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recoveryKey);
      if (!raw) return;
      const payload = JSON.parse(raw) as RecoveryPayload;
      if (!payload.sections?.length) return;
      const serverEmpty = !page.sections?.length;
      const recoveryNewer =
        payload.savedAt &&
        (!page.sections?.length ||
          new Date(payload.savedAt).getTime() > Date.now() - 86400000);
      if (serverEmpty || recoveryNewer) {
        const useRecovery = window.confirm(
          "Recover unsaved editor content from your last session?",
        );
        if (useRecovery) onRecover(payload.sections);
      }
    } catch {
      /* ignore corrupt recovery */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageKey]);

  useEffect(() => {
    if (!dirty) return;
    setStatus("unsaved");
    const backup: RecoveryPayload = {
      sections,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(recoveryKey, JSON.stringify(backup));
    } catch {
      /* quota */
    }
  }, [sections, dirty, recoveryKey]);

  const persist = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setStatus("saving");
    try {
      await saveBlogDraft(page, sectionsRef.current);
      setStatus("saved");
      try {
        localStorage.removeItem(recoveryKey);
      } catch {
        /* ignore */
      }
    } catch {
      setStatus("unsaved");
    } finally {
      savingRef.current = false;
    }
  }, [page, recoveryKey]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      void persist();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [sections, dirty, persist]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return { status, persist };
}
