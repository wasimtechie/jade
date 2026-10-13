import type { ReactNode } from "react";

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

type Props = {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
};

export function DashboardStatusBadge({
  tone = "neutral",
  children,
  className = "",
}: Props) {
  return (
    <span className={`dash-badge dash-badge--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}
