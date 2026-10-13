"use client";

import { ShieldCheck } from "lucide-react";
import { ChevronRight } from "lucide-react";
import {
  ALL_ROLES,
  ROLE_LABELS,
  ROUTE_MATRIX,
  type AccessLevel,
} from "@/lib/auth/permissions";
import { dash } from "@/lib/dashboard/dashboardClasses";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { DashStatusChip } from "./form";
import { DashboardModuleFrame } from "./ui/DashboardModuleFrame";

const LEVEL_VARIANT: Record<AccessLevel, "success" | "info" | "neutral"> = {
  write: "success",
  read: "info",
  none: "neutral",
};

const LEVEL_LABEL: Record<AccessLevel, string> = {
  write: "Write",
  read: "Read",
  none: "—",
};

export function RolesPermissionsManager() {
  return (
    <DashboardModuleFrame>
      <DashboardPanel pad className="w-full min-w-0">
        <p className="dashboard-data-table-scroll-hint" aria-hidden>
          <ChevronRight className="h-4 w-4" />
          Swipe for more columns
        </p>
        <div className={dash.dataTableWrap}>
          <table className={`${dash.dataTable} dash-roles-table`}>
            <thead>
              <tr>
                <th scope="col">Module / Route</th>
                {ALL_ROLES.map((r) => (
                  <th key={r} scope="col" className="text-center">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROUTE_MATRIX.map((entry) => (
                <tr key={entry.path}>
                  <td>
                    <p className="font-bold text-white">{entry.label}</p>
                    <p className="text-[length:var(--fs-desc)] text-[var(--dash-text-muted)]">
                      {entry.path}
                    </p>
                  </td>
                  {ALL_ROLES.map((r) => {
                    const level: AccessLevel = entry.perms[r] ?? "none";
                    return (
                      <td key={r} className="text-center">
                        <DashStatusChip variant={LEVEL_VARIANT[level]}>
                          {LEVEL_LABEL[level]}
                        </DashStatusChip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>

      <DashboardPanel pad>
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--dash-accent)]"
            aria-hidden
          />
          <div className={`${dash.muted} text-[length:var(--fs-desc)]`}>
            <p className="mb-1 font-bold text-[var(--dash-text)]">
              How enforcement works
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Middleware</strong> blocks page navigation and{" "}
                <strong>API routes</strong> check <code>requireRole</code> per
                handler.
              </li>
              <li>
                <strong>Team</strong> role is scoped to assigned villas on the
                calendar API.
              </li>
              <li>
                Changes here are documentation only — update{" "}
                <code>permissions.ts</code> and redeploy to change access.
              </li>
            </ul>
          </div>
        </div>
      </DashboardPanel>
    </DashboardModuleFrame>
  );
}
