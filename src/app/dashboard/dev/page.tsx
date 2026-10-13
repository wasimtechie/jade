import { redirect } from "next/navigation";

export default function DevDashboardIndexPage() {
  redirect("/dashboard/dev/logs/api");
}
