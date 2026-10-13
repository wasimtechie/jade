import BlogsPageClient from "./BlogsPageClient";
import { getMergedPublishedPosts } from "@/lib/cms/blogStore";
import { Suspense } from "react";
import BlogListLoading from "@/components/blog/BlogListLoading";

export const revalidate = 60;

async function BlogList({ searchParams }: { searchParams: { page?: string } }) {
  const posts = await getMergedPublishedPosts();
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const requestedPage = Number(searchParams.page);
  const currentPage = Math.min(totalPages, Math.max(1, Number.isInteger(requestedPage) ? requestedPage : 1));
  return <BlogsPageClient
    posts={posts.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
    currentPage={currentPage}
    totalPages={totalPages}
  />;
}

export default function BlogsPage({ searchParams }: { searchParams: { page?: string } }) {
  return <Suspense fallback={<BlogListLoading />}><BlogList searchParams={searchParams} /></Suspense>;
}
