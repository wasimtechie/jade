"use client";

import Image from "next/image";
import { SITE_ORIGIN } from "@/lib/cms/blogCms";
import { isUnoptimizedMediaUrl } from "@/lib/media/urls";

type BlogSeoPreviewsProps = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  fallbackImage: string;
};

export function BlogSeoPreviews({
  slug,
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImage,
  fallbackImage,
}: BlogSeoPreviewsProps) {
  const url = `${SITE_ORIGIN}/${slug || "your-slug"}/`;
  const title = metaTitle || "Your blog title";
  const description =
    metaDescription ||
    "Add a meta description to control how this post appears in search results.";
  const socialTitle = ogTitle || title;
  const socialDescription = ogDescription || description;
  const socialImage = ogImage || fallbackImage;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="border border-white/10 bg-black/30 p-4">
        <p className="mb-3 font-manrope text-xs font-bold uppercase tracking-widest text-[color:var(--dash-text-muted)]">
          Google search preview
        </p>
        <div className="space-y-1 font-arial text-left">
          <p className="truncate text-sm text-[#bdc1c6]">{url}</p>
          <p className="line-clamp-2 text-xl text-[#8ab4f8]">{title}</p>
          <p className="line-clamp-2 text-sm leading-snug text-[#bdc1c6]">
            {description}
          </p>
        </div>
      </div>
      <div className="border border-white/10 bg-black/30 p-4">
        <p className="mb-3 font-manrope text-xs font-bold uppercase tracking-widest text-[color:var(--dash-text-muted)]">
          Social preview
        </p>
        <div className="overflow-hidden border border-white/10 bg-[#1a1a1a]">
          <div className="relative aspect-[1.91/1] w-full bg-black/50">
            {socialImage ? (
              <Image
                src={socialImage}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
                unoptimized={isUnoptimizedMediaUrl(socialImage)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[color:var(--dash-text-muted)]">
                OG image
              </div>
            )}
          </div>
          <div className="space-y-1 p-3">
            <p className="truncate text-xs uppercase text-[color:var(--dash-text-muted)]">
              jadehospitainment.com
            </p>
            <p className="line-clamp-2 font-semibold text-white">{socialTitle}</p>
            <p className="line-clamp-2 text-xs text-[color:var(--dash-text-secondary)]">
              {socialDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
