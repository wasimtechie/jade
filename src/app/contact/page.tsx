"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  X,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PrimaryButton from "@/components/PrimaryButton";
import LiveBackground from "@/components/LiveBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import GoldAccentLine from "@/components/ui/GoldAccentLine";

/* ─────────────────────────────────────────────────────────────────────
   Glassmorphic Contact Card
───────────────────────────────────────────────────────────────────── */
function ContactCard({
  icon: Icon,
  title,
  subtitle,
  href,
  wrap = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href?: string;
  wrap?: boolean;
}) {
  const inner = (
    <div className="flex flex-col items-center text-center gap-2.5 py-8 px-8">
      <div className="w-10 h-10 flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-white/50" strokeWidth={1.5} />
      </div>
      <p
        className={`text-white font-manrope font-semibold text-gh-body tracking-wide ${wrap ? "" : "whitespace-nowrap"}`}
      >
        {title}
      </p>
      <p
        className={`text-white/50 font-manrope text-gh-desc ${wrap ? "" : "whitespace-nowrap"}`}
      >
        {subtitle}
      </p>
    </div>
  );

  const cardCls =
    "w-full rounded-none border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/[0.08] transition-colors duration-300";

  if (href) {
    return (
      <a href={href} className={cardCls}>
        {inner}
      </a>
    );
  }
  return <div className={cardCls}>{inner}</div>;
}

/* ─────────────────────────────────────────────────────────────────────
   Glassmorphic Coin (reused from Careers)
───────────────────────────────────────────────────────────────────── */
function JadeCoin() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-48 h-48 flex items-center justify-center mx-auto mb-8"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "rgba(255, 255, 255, 0.10)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 24px rgba(0,0,0,0.15)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 6,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "50%",
        }}
      />
      <Image
        src="/assets/JAde Correction.png"
        alt="Jade"
        width={128}
        height={128}
        className="relative z-10 w-32 h-32 object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  /* Body scroll lock while modal open */
  useEffect(() => {
    document.body.style.overflow = isSuccess ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSuccess]);

  function closeModal() {
    setIsSuccess(false);
  }

  return (
    <main className="relative min-h-screen bg-[#1A1C1E] text-white pb-16 lg:pb-0">
      {/* ── Navigation ── */}
      <Navbar />
      <MobileBottomNav />

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — Live Background, heading, contact cards
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pb-12 pt-24 md:pt-24">
        <GoldAccentLine className="absolute top-0 left-0 right-0 z-20" />
        {/* Live Background — matches UnifiedScrollSection: no heavy overlay */}
        <div className="absolute inset-0 z-0">
          <LiveBackground />
          {/* Subtle vignette only — keeps text readable without killing the background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>

        {/* ── Hero Copy — constrained center ── */}
        <div className="relative z-10 text-center w-full flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#EFCD62] text-gh-label font-bold tracking-[0.3em] uppercase mb-5"
          >
            CONTACT US
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gh-h1 font-philosopher leading-tight mb-6 max-w-3xl lg:max-w-none lg:whitespace-nowrap"
          >
            Planning a stay, celebration or partnership?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 font-manrope text-gh-body max-w-xl mx-auto leading-relaxed mb-11"
          >
            We&apos;re available{" "}
            <strong className="text-white font-semibold">
              10:00 AM – 7:00 PM
            </strong>
            ,{" "}
            <strong className="text-white font-semibold">
              Monday to Saturday.
            </strong>{" "}
            You can expect a response within one business day.
          </motion.p>

          {/* ── Contact Cards — wider container, independent of heading max-w ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-2.5 w-full max-w-5xl"
          >
            <ContactCard
              icon={Phone}
              title="Phone Number"
              subtitle="0897 066 3366"
              href="tel:08970663366"
            />
            <ContactCard
              icon={Mail}
              title="Info@jadehospitainment.com"
              subtitle="Responses within one business day"
              href="mailto:Info@jadehospitainment.com"
            />
            <ContactCard
              icon={MapPin}
              title="76, phase II, Royal Enclave, Srirampura, Bengaluru - 64"
              subtitle="Visits by prior appointment"
              wrap
            />
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ═══════════════════════════════════════════════════════════════
          SUCCESS MODAL
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSuccess && (
          <>
            {/* Backdrop — purely visual, closes on click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />

            {/* Centering wrapper — fixed inset-0 flex center, pointer-events-none so backdrop click passes through */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-4">
              {/* Relative wrapper so close button can float above */}
              <div className="relative pointer-events-auto w-full max-w-[520px]">
                {/* Close button — floats centered above the card */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-12 h-12 rounded-full bg-[#124131] flex items-center justify-center text-white hover:bg-[#1f5c48] transition-colors shadow-2xl"
                  >
                    <X className="w-6 h-6 stroke-[1.5]" />
                  </button>
                </div>

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-h-[85vh] bg-[#0B2C23] rounded-3xl flex flex-col shadow-2xl border border-white/10 overflow-hidden"
                >
                  <div className="flex flex-col items-center justify-center px-8 text-center pt-8 pb-8 overflow-y-auto" data-lenis-prevent>
                    {/* Glassy circular wrapper for the checkmark */}
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-[160px] h-[160px] shrink-0 relative mb-6 rounded-full flex items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          boxShadow:
                            "inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 24px rgba(0,0,0,0.15)",
                        }}
                      />
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: 6,
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <div className="w-[84px] h-[84px] shrink-0 relative drop-shadow-2xl">
                        <Image
                          src="/assets/JAde Correction.png"
                          alt="Success Check"
                          fill
                          sizes="96px"
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white text-gh-h2 font-philosopher mb-3"
                    >
                      We've got it from here
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 text-gh-body leading-relaxed mb-8 max-w-sm mx-auto font-manrope"
                    >
                      Thanks for sharing your details!
                      <br />
                      Our team will take a look and reach out shortly to
                      understand things better.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col w-full max-w-[280px] mx-auto gap-4"
                    >
                      <p className="text-white/50 text-gh-label font-bold tracking-[0.2em] uppercase text-center">
                        MEANWHILE CHECK US OUT HERE
                      </p>

                      <div className="flex justify-center gap-3">
                        {[
                          {
                            Icon: Facebook,
                            href: "https://www.facebook.com/jadehospitainment/",
                          },
                          {
                            Icon: Instagram,
                            href: "https://www.instagram.com/jadehospitainment/?hl=en",
                          },
                          {
                            Icon: Youtube,
                            href: "https://www.youtube.com/@jade_hospitainment",
                          },
                        ].map(({ Icon, href }, i) => (
                          <a
                            key={i}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/5 border border-white/20 flex items-center justify-center hover:bg-[#EFCD62] hover:text-black transition-all"
                          >
                            <Icon className="w-5 h-5" />
                          </a>
                        ))}
                      </div>

                      <p className="text-white/30 text-gh-label italic text-center">
                        Thoughtfully operated. Always.
                      </p>

                      <PrimaryButton
                        withArrow={false}
                        width="form"
                        onClick={closeModal}
                      >
                        OKAY
                      </PrimaryButton>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
