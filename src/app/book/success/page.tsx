"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, ArrowRight, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ref = searchParams?.get("ref") ?? "JH-XXXXXX";
  const villa = searchParams?.get("villa") ?? "Your Villa";
  const checkIn = searchParams?.get("checkIn") ?? "—";
  const checkOut = searchParams?.get("checkOut") ?? "—";
  const guests = searchParams?.get("guests") ?? "—";

  // Prevent back-navigation loop
  useEffect(() => {
    window.history.replaceState(null, "", "/book/success");
  }, []);

  return (
    <main className="min-h-screen bg-[#0B2C23] flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 max-w-md w-full"
        >
          {/* Success Icon */}
          <div className="relative">
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              className="w-20 h-20 text-jade-gold"
            >
              <CheckCircle className="w-full h-full" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-philosopher text-gh-h1 text-white leading-tight mb-2">
              Booking Request Sent!
            </h1>
            <p className="text-white/60 font-manrope text-gh-body leading-relaxed">
              Our team will reach out within 2 hours to confirm your stay.
            </p>
          </div>

          {/* Reference Card */}
          <div className="w-full bg-white/5 border border-white/10 p-6 space-y-3 text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-white/50 font-manrope text-gh-label uppercase tracking-widest">
                Booking Reference
              </span>
              <span className="text-jade-gold font-philosopher text-gh-h3 tracking-wider">
                {ref}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-white/70 font-manrope text-gh-desc">
                <Home className="w-4 h-4 text-jade-gold shrink-0" />
                <span>{villa}</span>
              </div>
              {(checkIn !== "—" || checkOut !== "—") && (
                <div className="flex items-center gap-2.5 text-white/70 font-manrope text-gh-desc">
                  <Calendar className="w-4 h-4 text-jade-gold shrink-0" />
                  <span>
                    {checkIn} → {checkOut}
                  </span>
                </div>
              )}
              {guests !== "—" && (
                <div className="flex items-center gap-2.5 text-white/70 font-manrope text-gh-desc">
                  <Users className="w-4 h-4 text-jade-gold shrink-0" />
                  <span>{guests} Guests</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-white/30 font-manrope text-gh-label">
            A confirmation email will be sent to the address you provided once payment is complete.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
            <Link
              href="/"
              className="flex-1 border border-white/20 text-white font-manrope font-bold text-gh-label tracking-widest uppercase text-center py-3.5 hover:border-white/50 hover:text-white transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/retreats/"
              className="flex-1 bg-jade-gold text-[#0B2C23] font-manrope font-bold text-gh-label tracking-widest uppercase text-center py-3.5 hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              EXPLORE MORE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="h-24 md:hidden" />
      <MobileBottomNav />
    </main>
  );
}

export default function BookSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B2C23] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-jade-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
