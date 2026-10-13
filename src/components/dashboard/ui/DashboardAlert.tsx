import type { ReactNode } from "react";

type AlertTone = "success" | "warning" | "danger" | "info";

type Props = {
  tone?: AlertTone;
  children: ReactNode;
  icon?: ReactNode;
};

export function DashboardAlert({ tone = "info", children, icon }: Props) {
  return (
    <div className={`dash-alert dash-alert--${tone}`} role="status">
      {icon}
      <div>{children}</div>
    </div>
  );
}
