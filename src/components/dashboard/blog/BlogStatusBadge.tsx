import type { CmsPageStatus } from "@/lib/cms/blogCms";
import { STATUS_LABELS } from "@/lib/cms/blogWorkflow";
import { DashboardStatusBadge, type StatusTone } from "../ui/DashboardStatusBadge";

const STATUS_TONE: Record<CmsPageStatus, StatusTone> = {
  draft: "neutral",
  in_review: "info",
  approved: "info",
  scheduled: "warning",
  published: "success",
  archived: "neutral",
  trashed: "danger",
};

export function BlogStatusBadge({ status }: { status: CmsPageStatus }) {
  return (
    <DashboardStatusBadge tone={STATUS_TONE[status] ?? "neutral"}>
      {STATUS_LABELS[status] ?? status}
    </DashboardStatusBadge>
  );
}
