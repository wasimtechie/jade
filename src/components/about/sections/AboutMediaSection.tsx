"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import JadeImage from "@/components/ui/JadeImage";

export type AboutMediaImage = { src: string; alt?: string };

export const DEFAULT_ABOUT_MEDIA: AboutMediaImage[] = [
  { src: "/Awards_and_Recognition/764.webp", alt: "Award recognition" },
  { src: "/Awards_and_Recognition/ds.webp", alt: "Award recognition" },
  { src: "/Awards_and_Recognition/msa.webp", alt: "Award recognition" },
];

export type AboutMediaSectionProps = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  featuredImage?: string;
  featuredCaption?: string;
  gridImages?: AboutMediaImage[];
};

export default function AboutMediaSection({
  eyebrow = "MEDIA",
  heading = "Awards and Recognition",
  body = "Recognised by industry platforms, media, and partners for our approach to private hospitality and curated experiences.",
  featuredImage = "/Awards_and_Recognition/dsas.webp",
  featuredCaption = "Recognized for Excellence in Hospitality",
  gridImages = DEFAULT_ABOUT_MEDIA,
}: AboutMediaSectionProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const tiles = gridImages.length > 0 ? gridImages : DEFAULT_ABOUT_MEDIA;

  return (
    <section className="jade-section bg-[#1A1C1E] !pt-6 md:!pt-8 lg:!pt-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 text-center md:mb-10">
          <h3 className="mb-3 text-[#EFCD62] text-gh-label font-bold uppercase tracking-[0.2em]">
            {eyebrow}
          </h3>
          <h2 className="mb-5 font-philosopher text-gh-h2 text-white">{heading}</h2>
          <p className="mx-auto max-w-2xl font-manrope text-gh-body text-white/60">
            {body}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {tiles.slice(0, 3).map((item) => (
            <button
              key={item.src}
              type="button"
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-none border border-white/10 bg-white/5"
              onClick={() => setPreview(item.src)}
            >
              <Image
                src={item.src}
                alt={item.alt ?? "Media"}
                fill
                className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          ))}
          <div className="col-span-1 pt-3 md:col-span-3 md:pt-4">
            <button
              type="button"
              className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-none border border-white/10 bg-white/5"
              onClick={() => setPreview(featuredImage)}
            >
              <Image
                src={featuredImage}
                alt={featuredCaption}
                fill
                className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <p className="font-philosopher text-gh-h2 text-white">
                  {featuredCaption}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {preview && (
          <motion.div
            key={preview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[80] flex cursor-pointer items-center justify-center bg-black/60 backdrop-blur-[2px]"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.98, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-video w-[92vw] max-w-5xl overflow-hidden border border-white/15 bg-black/40 md:aspect-[16/9]"
            >
              <JadeImage
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
                sizes="92vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
