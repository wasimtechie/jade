import type { SeoHealthResult } from "@/lib/cms/blogSeoHealth";
import { seoScoreBucket } from "@/lib/cms/blogSeoHealth";
import { DashboardStatusBadge, type StatusTone } from "../ui/DashboardStatusBadge";

function toneForScore(health: SeoHealthResult): StatusTone {
  if (health.complete) return "success";
  const bucket = seoScoreBucket(health.score);
  if (bucket === "good") return "success";
  if (bucket === "fair") return "warning";
  return "danger";
}

export function BlogSeoHealthBadge({ health }: { health: SeoHealthResult }) {
  const tone = toneForScore(health);
  const label = health.complete ? "SEO OK" : `${health.score}%`;

  return (
    <DashboardStatusBadge tone={tone} className="tabular-nums">
      {label}
    </DashboardStatusBadge>
  );
}
