import { redirect } from "next/navigation";

/** SEO section index — land on SEO Manager. */
export default function SeoDashboardIndexPage() {
  redirect("/dashboard/seo/manager");
}
