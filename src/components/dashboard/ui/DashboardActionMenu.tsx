"use client";

import { useRef, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { DashboardDropdownMenu } from "./DashboardDropdownMenu";

type DashboardActionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  label?: string;
  triggerClassName?: string;
  icon?: ReactNode;
};

export function DashboardActionMenu({
  open,
  onOpenChange,
  children,
  label = "Actions",
  triggerClassName = "",
  icon,
}: DashboardActionMenuProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex justify-end">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={
          triggerClassName ||
          "inline-flex min-h-[var(--dash-control-h)] min-w-[var(--dash-control-h)] items-center justify-center rounded text-[color:var(--dash-text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
        }
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {icon ?? <MoreHorizontal className="h-4 w-4" />}
      </button>
      <DashboardDropdownMenu
        open={open}
        onClose={() => onOpenChange(false)}
        anchorRef={anchorRef}
      >
        {children}
      </DashboardDropdownMenu>
    </div>
  );
}
