"use client";

import { useRef } from "react";
import clsx from "clsx";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import NavbarThemeTrigger from "./NavbarThemeTrigger";

import { BLOG_POSTS } from "@/data/blogs";

const BlogCard = ({ post }: { post: any }) => {
  return (
    <Link
      href={post.link}
      className="group relative block w-[280px] sm:w-[340px] md:w-[380px] lg:w-[400px]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-sm mb-4">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 1024px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
      </div>

      <div className="flex flex-col pr-4">
        {/* Title - Systematic size and clamping */}
        <h3 className="font-philosopher text-gh-h3 text-white group-hover:text-[#EFCD62] transition-colors mb-2.5 line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="font-manrope text-white/60 text-[0.85rem] sm:text-[0.9rem] leading-relaxed line-clamp-2 mb-4 min-h-[3em]">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 text-[#EFCD62] text-[0.75rem] sm:text-gh-label font-bold tracking-[0.2em] uppercase group-hover:gap-4 transition-all duration-300">
          View Blog <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default function BlogSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="jade-section relative flex flex-col justify-center"
      style={{ backgroundColor: "#25282C" }}
    >
      <NavbarThemeTrigger theme="golden" sectionRef={sectionRef} />
      <div className="max-w-[1920px] mx-auto w-full px-6 md:px-12 lg:px-24">
        {/* Header Area */}
        <div className="mb-6 lg:mb-10">
          <div className="max-w-2xl lg:max-w-none">
            <p
              className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62]"
              style={{ marginBottom: "clamp(4px, 0.64vw, 8px)" }}
            >
              BLOG
            </p>
            <h2
              className="leading-tight"
              style={{ marginBottom: "clamp(8px, 1.28vw, 10.2px)" }}
            >
              <Link
                href="/blogs"
                className="group inline-flex items-center gap-2 sm:gap-2.5 text-white hover:text-[#EFCD62] transition-colors"
              >
                <span className="font-philosopher text-gh-h2 sm:text-gh-h1">
                  From the Journal
                </span>
                <ChevronRight
                  className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 stroke-[1.25] transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </h2>
            <p className="font-manrope text-white/60 text-[0.9rem] sm:text-gh-body leading-relaxed max-w-md lg:max-w-none lg:whitespace-nowrap">
              Thoughts on hosting, travel, and creating meaningful experiences
              through space.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal scroll bleeds to the viewport edge on both sides but items align with heading */}
      <div className="max-w-[1920px] mx-auto w-full min-w-0">
        <div
          data-jade-hscroll
          className="jade-hscroll-track flex gap-8 lg:gap-11 overflow-x-auto pb-8 md:pb-10 scrollbar-none snap-x snap-mandatory overscroll-x-contain"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {BLOG_POSTS.map((post, index) => (
            <div
              key={post.id}
              className={clsx(
                "snap-start flex-shrink-0 jade-hscroll-view-item",
                index === 0 && "pl-6 md:pl-12 lg:pl-24",
                index === BLOG_POSTS.length - 1 && "pr-6 md:pr-12 lg:pr-24"
              )}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
