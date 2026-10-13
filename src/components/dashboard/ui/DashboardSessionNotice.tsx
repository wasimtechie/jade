"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { dash } from "@/lib/dashboard/dashboardClasses";

const WARN_BEFORE_MS = 5 * 60 * 1000;
const SESSION_MAX_MS = 24 * 60 * 60 * 1000;

export function DashboardSessionNotice() {
  const { data: session } = useSession();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!session) return;
    const started = Date.now();
    const timer = window.setTimeout(() => {
      setShowWarning(true);
    }, Math.max(0, SESSION_MAX_MS - WARN_BEFORE_MS));

    return () => window.clearTimeout(timer);
  }, [session]);

  if (!showWarning) return null;

  return (
    <div className="dash-session-notice" role="status">
      <p className={dash.muted}>
        Your session may expire soon. Save any work in progress and sign in again
        if you are logged out.
      </p>
      <button
        type="button"
        className={`${dash.btn} ${dash.btnText} ${dash.btnDense}`}
        onClick={() => setShowWarning(false)}
      >
        Dismiss
      </button>
    </div>
  );
}
