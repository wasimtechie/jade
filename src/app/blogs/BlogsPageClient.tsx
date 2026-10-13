"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import PrimaryButton from "@/components/PrimaryButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import type { BlogPost } from "@/data/blogs";
import SectionFillTransition from "@/components/ui/SectionFillTransition";

const BlogCard = ({ post, index }: { post: BlogPost; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group flex flex-col h-full bg-[#1E2023] border border-white/5 hover:border-[#EFCD62]/30 transition-all duration-500"
    >
      <Link
        href={post.link}
        className="relative aspect-[16/10] overflow-hidden block"
      >
        <Image
          src={post.thumbnail || post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#EFCD62] text-black text-[10px] font-manrope font-bold tracking-widest uppercase px-3 py-1">
            {post.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
      </Link>

      <div className="flex flex-col flex-1 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3 text-white/40 text-[11px] font-manrope tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#EFCD62]" />
            {post.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#EFCD62]" />
            {post.readTime}
          </div>
        </div>

        <h3 className="font-philosopher text-gh-h3 md:text-gh-h3 text-white group-hover:text-[#EFCD62] transition-colors mb-3 leading-snug">
          <Link href={post.link}>{post.title}</Link>
        </h3>

        <p className="font-manrope text-white/60 text-gh-body leading-relaxed mb-6 line-clamp-3">
          {post.excerpt || post.description}
        </p>

        <div className="mt-auto">
          <Link
            href={post.link}
            className="inline-flex items-center gap-2.5 text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase group-hover:gap-5 transition-all duration-300"
          >
            Read More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

type BlogsPageClientProps = {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
};

export default function BlogsPageClient({ posts, currentPage, totalPages }: BlogsPageClientProps) {
  return (
    <main className="relative min-h-screen bg-[#25282C] text-white">
      <Navbar />
      <MobileBottomNav />

      <section className="pt-24 pb-12 md:pt-40 md:pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          <div className="max-w-3xl">
            <p className="font-manrope text-gh-label tracking-[0.3em] uppercase text-[#EFCD62] mb-5">
              OUR JOURNAL
            </p>
            <h1 className="font-philosopher text-gh-h1 text-white mb-6 leading-tight">
              Stories of Hospitality, <br />
              <span className="italic text-[#EFCD62]">Architecture</span> &
              Escape
            </h1>
            <p className="font-manrope text-white/70 text-gh-body max-w-xl leading-relaxed">
              Explore our curation of thoughts on luxury private stays,
              corporate culture, and the art of hosted entertainment near
              Bangalore.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full h-[1px] bg-white/10" />

      <section className="jade-section px-6 md:px-12 lg:px-24">
        <div className="max-w-[1920px] mx-auto">
          {posts.length === 0 ? (
            <p className="font-manrope text-white/50">No posts published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {posts.map((post, idx) => (
                <BlogCard key={post.slug} post={post} index={idx} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav aria-label="Blog pages" className="mt-12 flex items-center justify-center gap-6 font-manrope text-sm">
              {currentPage > 1 && (
                <Link href={currentPage === 2 ? "/blogs/" : `/blogs/?page=${currentPage - 1}`} className="text-[#EFCD62] hover:underline">
                  Previous
                </Link>
              )}
              <span className="text-white/60">Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages && (
                <Link href={`/blogs/?page=${currentPage + 1}`} className="text-[#EFCD62] hover:underline">
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>

      <SectionFillTransition from="charcoal" to="deep" />
      <section className="jade-section bg-[#1E2023] border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-[#EFCD62] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 rounded-none">
            <div className="max-w-xl text-black">
              <h2 className="font-philosopher text-gh-h2 mb-3 leading-tight">
                Get the latest from <br /> Jade Hospitainment
              </h2>
              <p className="font-manrope text-black/70 text-gh-body">
                Subscribe to our newsletter for exclusive offers, curated escape
                ideas, and architectural highlights.
              </p>
            </div>
            <div className="w-full max-w-md flex flex-col md:flex-row gap-3">
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 bg-white/20 border border-black/10 px-6 py-4 text-black placeholder:text-black/40 focus:outline-none focus:bg-white/30 transition-all font-manrope text-gh-label"
              />
              <PrimaryButton
                width="compact"
                withArrow={false}
                className="!bg-black !text-[#EFCD62] !ring-0 hover:!bg-black/90 shrink-0"
              >
                JOIN
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
