"use client";

import React from "react";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { useSafeBack } from "@/lib/safeBackNavigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CorporateHeader() {
  const goBack = useSafeBack("/corporate-retreats");

  return (
    <header className="jade-scroll-chrome fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-5 pointer-events-none">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={goBack}
        className="rounded-none border border-white/15 bg-transparent p-2 text-white backdrop-blur-2xl pointer-events-auto transition-all hover:border-white/35"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Mobile: Dialer */}
      <motion.a
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        href="tel:08970663366"
        className="md:hidden flex items-center justify-center rounded-none border border-white/15 bg-transparent p-2 text-white backdrop-blur-2xl pointer-events-auto transition-all hover:border-white/35"
        aria-label="Call to enquire"
      >
        <Phone className="w-5 h-5" />
      </motion.a>

      {/* Desktop: Contact Page */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:block"
      >
        <Link
          href="/contact"
          className="flex items-center justify-center rounded-none border border-white/15 bg-transparent p-2 text-white backdrop-blur-2xl pointer-events-auto transition-all hover:border-white/35"
          aria-label="Enquire with us"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
      </motion.div>
    </header>
  );
}
