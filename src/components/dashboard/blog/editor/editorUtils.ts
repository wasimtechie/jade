"use client";

import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";

export async function uploadBlogMedia(
  file: File,
  blogSlug: string,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("villaSlug", `blog/${blogSlug}`);
  const res = await dashboardFetch("/api/dashboard/media/upload", {
    method: "POST",
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    publicUrl?: string;
    error?: string;
  };
  const url = data.publicUrl ?? data.url;
  if (!res.ok || !url) {
    throw new Error(data.error ?? "Upload failed");
  }
  return url;
}
