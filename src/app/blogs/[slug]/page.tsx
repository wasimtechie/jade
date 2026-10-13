import { notFound, permanentRedirect } from "next/navigation";
import { getMergedPostBySlug } from "@/lib/cms/blogStore";

export default async function LegacyBlogPage({ params }: { params: { slug: string } }) {
  const post = await getMergedPostBySlug(params.slug);
  if (!post) notFound();
  permanentRedirect(`/${post.slug}/`);
}
