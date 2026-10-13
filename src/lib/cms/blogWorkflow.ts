import type { CmsPageStatus } from "@/lib/cms/blogCms";

export type WorkflowAction =
  | "submit_review"
  | "approve"
  | "reject"
  | "request_changes"
  | "publish"
  | "unpublish"
  | "schedule"
  | "archive"
  | "restore"
  | "trash"
  | "restore_trash"
  | "delete_permanent";

const TRANSITIONS: Record<WorkflowAction, { from: CmsPageStatus[]; to: CmsPageStatus }> = {
  submit_review: { from: ["draft", "approved"], to: "in_review" },
  approve: { from: ["in_review"], to: "approved" },
  reject: { from: ["in_review"], to: "draft" },
  request_changes: { from: ["in_review", "approved"], to: "draft" },
  publish: { from: ["draft", "approved", "scheduled", "archived"], to: "published" },
  unpublish: { from: ["published"], to: "draft" },
  schedule: { from: ["draft", "approved", "in_review"], to: "scheduled" },
  archive: { from: ["published", "draft", "approved"], to: "archived" },
  restore: { from: ["archived"], to: "draft" },
  trash: {
    from: ["draft", "in_review", "approved", "scheduled", "published", "archived"],
    to: "trashed",
  },
  restore_trash: { from: ["trashed"], to: "draft" },
  delete_permanent: { from: ["trashed"], to: "trashed" },
};

export function canTransition(
  current: CmsPageStatus,
  action: WorkflowAction,
): boolean {
  const rule = TRANSITIONS[action];
  return rule.from.includes(current);
}

export function nextStatus(
  current: CmsPageStatus,
  action: WorkflowAction,
): CmsPageStatus | null {
  if (!canTransition(current, action)) return null;
  return TRANSITIONS[action].to;
}

export const STATUS_LABELS: Record<CmsPageStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
  trashed: "Trashed",
};

export const STATUS_COLORS: Record<CmsPageStatus, string> = {
  draft: "text-white/45",
  in_review: "text-sky-300",
  approved: "text-cyan-300",
  scheduled: "text-amber-300",
  published: "text-emerald-300",
  archived: "text-violet-300",
  trashed: "text-red-300",
};
