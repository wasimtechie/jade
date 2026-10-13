"use client";

import { DashboardConfirmDialog } from "../ui/DashboardConfirmDialog";

type BlogConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BlogConfirmDialog(props: BlogConfirmDialogProps) {
  return <DashboardConfirmDialog {...props} />;
}
