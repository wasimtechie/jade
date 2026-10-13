/**
 * @deprecated Prefer `dash` classes from `dashboardClasses.ts` + `dashboard.css`.
 * Kept for gradual migration in modules not yet refactored.
 */
export const DASHBOARD_PAD = {
  panel: "var(--dash-gutter)",
  card: "var(--dash-space-4)",
  stack: "var(--dash-space-5)",
  inline: "var(--dash-space-2)",
  section: "var(--dash-section-gap)",
} as const;

export { dash, dashAccent } from "./dashboardClasses";
