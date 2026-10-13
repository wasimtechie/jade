"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import PrimaryButton from "@/components/PrimaryButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { BlogPost } from "@/data/blogs";
import { BlogSectionRenderer } from "@/components/blog/BlogSectionRenderer";
import { shouldShowProseLead } from "@/components/blog/blogProseUtils";
import { useAnimation } from "@/context/AnimationContext";

interface PostContentProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function PostContent({ post, relatedPosts }: PostContentProps) {
  const { setEnquireOverlayOpen } = useAnimation();
  const showLead = shouldShowProseLead(post);
  const heroImage =
    post.image && post.image !== "/og-default.jpg"
      ? post.image
      : post.sections.find((s) => s.type === "image" && s.image)?.image ??
        post.image;
  return (
    <main className="relative min-h-screen bg-[#25282C] text-white">
      <Navbar />
      <MobileBottomNav />

      {/* Hero Header */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-[1920px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-5 mb-6">
              <Link
                href="/blogs"
                className="group flex items-center gap-2 text-white/40 hover:text-[#EFCD62] transition-colors uppercase text-gh-label tracking-widest"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />{" "}
                Back
              </Link>
              <div className="w-[1px] h-4 bg-white/20" />
              <span className="text-[#EFCD62] font-manrope font-bold tracking-[0.2em] uppercase text-gh-label">
                {post.category}
              </span>
            </div>

            <h1 className="font-philosopher text-gh-h1 md:text-[80px] text-white mb-8 leading-[1.1]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/50 text-gh-label uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#EFCD62]/60" /> {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EFCD62]/60" /> {post.readTime}
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <Share2 className="w-4 h-4 text-[#EFCD62]/60" /> Share Story
              </div>
            </div>
          </motion.div>
        </div>

        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-gradient-to-l from-[#EFCD62]/20 to-transparent" />
          <Image
            src={post.image}
            alt="Decoration"
            fill
            className="object-cover grayscale"
          />
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6 md:px-12 lg:px-24 mb-20">
        <div className="max-w-[1920px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[21/9] w-full overflow-hidden"
          >
            <Image
              src={heroImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        </div>
      </section>

      {/* Content Layout */}
      <section className="jade-section px-6 md:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-16">
          {/* Main Article Content */}
          <article className="lg:w-[65%]">
            {showLead && (
              <p className="blog-prose-lead">{post.excerpt}</p>
            )}
            <BlogSectionRenderer
              sections={post.sections}
              onEnquireClick={() => setEnquireOverlayOpen(true)}
            />

            {/* Tags & Footer Meta */}
            <div className="pt-16 border-t border-white/10 flex flex-wrap gap-3">
              {(post.tags || ["WELLNESS", "RETREAT", "JOURNAL", "LUXURY"]).map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-manrope font-bold tracking-[0.2em] text-[#EFCD62] border border-[#EFCD62]/30 px-3 py-1.5 hover:bg-[#EFCD62]/10 transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ),
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-[35%] space-y-12">
            <div className="sticky top-32 space-y-12">
              {/* Share */}
              <div className="bg-white/5 p-8 border border-white/10 rounded-sm">
                <h4 className="font-philosopher text-xl text-white mb-5">
                  Share this Story
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[Facebook, Twitter, Linkedin].map((Icon, idx) => (
                    <button
                      key={idx}
                      className="flex items-center justify-center p-4 bg-white/5 border border-white/10 hover:border-[#EFCD62] hover:bg-[#EFCD62]/5 transition-all group"
                    >
                      <Icon className="w-5 h-5 text-[#EFCD62] group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky Newsletter */}
              <div className="sticky top-32 bg-[#EFCD62] p-8 md:p-10 rounded-sm text-black">
                <h4 className="font-philosopher text-2xl mb-3 leading-tight">
                  Stay Inspired
                </h4>
                <p className="font-manrope text-sm text-black/70 mb-6 leading-relaxed">
                  Join our list for monthly curations of Bangalore's finest
                  escapes and architectural highlights.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    className="w-full bg-black/10 border border-black/10 px-6 py-4 text-black placeholder:text-black/40 focus:outline-none focus:bg-black/20 transition-all font-manrope text-xs tracking-widest font-bold"
                  />
                  <PrimaryButton
                    width="form"
                    withArrow={false}
                    className="!bg-black !text-[#EFCD62] !ring-0 hover:!bg-black/90"
                  >
                    JOIN THE LIST
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Reading */}
      <section className="jade-section bg-[#1E2023] border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[#EFCD62] text-gh-label tracking-widest uppercase mb-3">
                CONTINUE READING
              </p>
              <h2 className="font-philosopher text-gh-h2 text-white">
                More from Journal
              </h2>
            </div>
            <Link
              href="/blogs"
              className="hidden md:flex items-center gap-2 text-white/40 hover:text-[#EFCD62] transition-all uppercase text-gh-label tracking-widest font-bold"
            >
              Journal Archive <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rPost, idx) => (
              <Link
                key={rPost.id}
                href={`/${rPost.slug}/`}
                className="group block space-y-5"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={rPost.image}
                    alt={rPost.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2.5">
                  <span className="text-[#EFCD62] text-[10px] font-bold tracking-[0.2em] uppercase">
                    {rPost.category}
                  </span>
                  <h3 className="font-philosopher text-gh-h3 text-white group-hover:text-[#EFCD62] transition-colors leading-snug">
                    {rPost.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
