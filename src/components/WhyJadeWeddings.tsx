"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const BENEFITS = [
  {
    title: "FULLY PRIVATE VENUES",
    description:
      "No shared spaces, no parallel events, complete control over the setting.",
  },
  {
    title: "OUTDOOR-FIRST LAYOUTS",
    description:
      "Lawns, gardens, and open-air spaces designed for ceremonies, receptions, and celebrations.",
  },
  {
    title: "FLEXIBLE PLANNING",
    description:
      "Freedom to work with your own decorators, caterers, photographers, and planners.",
  },
  {
    title: "BUILT FOR SCALE",
    description:
      "Venues that support intimate gatherings as well as large, multi-event weddings.",
  },
];

export default function WhyJadeWeddings() {
  const [whyImages, setWhyImages] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/experiences/weddings/media");
        if (!res.ok) return;
        const data = await res.json();
        const group = (data?.groups || []).find((g: any) =>
          String(g.folder || "")
            .toLowerCase()
            .includes("4-why"),
        );
        const images = (group?.images || data?.all || []).filter(Boolean);
        if (!cancelled) setWhyImages(images);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = useMemo(() => whyImages[0] || "", [whyImages]);

  return (
    <section className="jade-section bg-[#0B2C23]">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* IMAGE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[16/10] md:aspect-video rounded-sm overflow-hidden shadow-2xl"
          >
            {hero ? (
              <Image
                src={hero}
                alt="Why Jade Wedding Venues"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0B2C23] to-black/70" />
            )}
          </motion.div>

          {/* CONTENT SECTION */}
          <div className="flex flex-col">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-philosopher text-gh-h1 text-white"
              style={{ marginBottom: "clamp(20.5px, 3.84vw, 41px)" }}
            >
              Why Jade Wedding Venues
            </motion.h2>

            <div className="space-y-6 md:space-y-8">
              {BENEFITS.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex gap-3 sm:gap-4 group"
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#EFCD62] rotate-45 transform transition-transform group-hover:rotate-[225deg] duration-700" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-manrope font-bold text-white text-gh-body tracking-[0.1em] uppercase">
                      {benefit.title}
                    </h3>
                    <p className="font-manrope text-white/60 text-gh-desc sm:text-gh-body leading-relaxed max-w-lg">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
