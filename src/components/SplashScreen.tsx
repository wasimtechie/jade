"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAnimation } from "@/context/AnimationContext";
import {
  lockSplashScroll,
  scheduleSplashScrollLock,
  unlockSplashScroll,
} from "@/lib/splashScrollLock";

export default function SplashScreen() {
  const { isSplashComplete, setSplashComplete } = useAnimation();
  const [stage, setStage] = useState(0);

  // Lock page scroll until curtain animation completes (stage 4 → setSplashComplete).
  useEffect(() => {
    if (isSplashComplete) {
      unlockSplashScroll();
      return;
    }

    const cancelRetries = scheduleSplashScrollLock();

    return () => {
      cancelRetries();
      unlockSplashScroll();
    };
  }, [isSplashComplete]);

  // --- Sequence Logic ---
  useEffect(() => {
    const sequence = async () => {
      // Step 1: Text Enters (slight below center)
      await new Promise((r) => setTimeout(r, 250));
      setStage(1); // ACTION: Text enters at 55%

      // Step 2: Curtain Reveals + Text Pushes UP
      await new Promise((r) => setTimeout(r, 700));
      setStage(2); // ACTION: Curtain opens, text moves to 40%

      // Step 3: Text Reading & Exit (1 sec stay at top)
      await new Promise((r) => setTimeout(r, 1500)); // Faster hold: shorter read time before exit
      setStage(3); // ACTION: Text exits

      // Step 4: Final Expansion
      await new Promise((r) => setTimeout(r, 800));
      setStage(4); // ACTION: Curtain expands to full
    };

    sequence();
  }, []);

  // --- Completion Handler ---
  const handleAnimationComplete = () => {
    if (stage === 4) {
      unlockSplashScroll();
      setSplashComplete(true);
    }
  };

  // --- Curtain Variants ---
  const curtainVariants = {
    initial: { width: "0vw", height: "0vh" },
    stage2: {
      width: "clamp(250px, 35vw, 450px)",
      height: "clamp(250px, 35vh, 450px)",
      transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
    },
    full: {
      width: "100vw",
      height: "100dvh",
      transition: { duration: 1.1, ease: "easeInOut" },
    },
  };

  // --- Text Variants ---
  const textContainerVars = {
    initial: { top: "55%", opacity: 0 },
    enter: {
      top: "55%",
      opacity: 1,
      transition: {
        duration: 0.55,
        staggerChildren: 0.1,
        delayChildren: 0.12,
      },
    },
    push: {
      top: "40%",
      opacity: 1,
      transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      top: "40%", // Lock at top-center position
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  };

  const textItemVars = {
    initial: {
      y: 40,
      opacity: 0,
      clipPath: "inset(0 0 0 0)",
    },
    enter: {
      y: 0,
      opacity: 1,
      clipPath: "inset(0 0 0 0)",
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    push: {
      y: 0,
      opacity: 1,
      clipPath: "inset(0 0 0 0)",
      transition: { duration: 1.1 },
    },
    exit: {
      y: 0, // No downward motion of the text itself
      opacity: 0,
      clipPath: "inset(100% 0 0 0)", // Wipe from top to bottom
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
  };

  if (isSplashComplete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* ------------------------------------------------------- */}
      {/* [ LAYER 0 ] HERO IMAGE (Hidden behind the "Shadow")     */}
      {/* ------------------------------------------------------- */}
      {/* [ LAYER 0 ] HOME SCREEN (revealed through the hole) */}
      {/* Background is removed here to show LandingPage directly */}

      {/* ------------------------------------------------------- */}
      {/* [ LAYER 1 ] THE TRANSPARENT DIV (Window)                */}
      {/* ------------------------------------------------------- */}
      <motion.div
        className="absolute z-10 bg-transparent rounded-none"
        style={{
          left: "50%",
          bottom: 0,
          x: "-50%",
          // The Magic Shadow that creates the "Curtain"
          boxShadow: "0 0 0 500vmax #25282C",
        }}
        initial="initial"
        animate={stage < 2 ? "initial" : stage === 4 ? "full" : "stage2"}
        variants={curtainVariants}
        onAnimationComplete={handleAnimationComplete}
      />

      {/* ------------------------------------------------------- */}
      {/* [ LAYER 2 ] TEXT CONTAINER                              */}
      {/* ------------------------------------------------------- */}
      <AnimatePresence>
        {stage >= 1 && stage <= 3 && (
          <motion.div
            className="absolute z-20 flex flex-col items-center justify-center left-1/2"
            style={{ x: "-50%", y: "-50%" }}
            variants={textContainerVars}
            initial="initial"
            animate={stage === 1 ? "enter" : stage === 2 ? "push" : "exit"}
            exit="exit"
          >
            {/* 1. Intro Label */}
            <div className="overflow-hidden">
              <motion.p
                variants={textItemVars}
                style={{ fontSize: "clamp(12px, 3.2vw, 16px)" }}
                className="font-manrope tracking-[0.2em] text-white/60 uppercase"
              >
                Step into the world of
              </motion.p>
            </div>

            {/* Spacing — subtitle ↔ brand name: generous gap to separate groups */}
            <div style={{ height: "clamp(9.6px, 2.4vw, 16px)" }} />

            {/* 2. Main Title Group — Proximity: zero gap = one visual unit */}
            <div className="flex flex-col items-center" style={{ gap: 0 }}>
              <div className="overflow-hidden pt-[0.12em] pb-[0.14em] -mt-[0.12em] -mb-[0.06em]">
                <motion.h1
                  variants={textItemVars}
                  style={{
                    fontSize: "clamp(32px, 8.5vw, 54px)",
                    lineHeight: 1.22,
                  }}
                  className="font-philosopher text-white text-center"
                >
                  Jade
                </motion.h1>
              </div>
              <div className="overflow-hidden -mt-[clamp(3px,0.96vw,6px)]">
                <motion.h2
                  variants={textItemVars}
                  style={{
                    fontSize: "clamp(32px, 8.5vw, 54px)",
                    lineHeight: 1.22,
                  }}
                  className="font-philosopher text-white/90 text-center"
                >
                  Hospitainment
                </motion.h2>
              </div>
            </div>

            {/* Spacing — brand name ↔ logo: wider gap to separate groups */}
            <div style={{ height: "clamp(16px, 3.2vw, 25.6px)" }} />

            {/* 3. Logo Icon */}
            <div className="overflow-hidden">
              <motion.div
                variants={textItemVars}
                className="relative"
                style={{
                  width: "clamp(45px, 12vw, 75px)",
                  height: "clamp(45px, 12vw, 75px)",
                }}
              >
                <Image
                  src="/assets/Golden_Logo.png"
                  alt="Jade Logo"
                  fill
                  sizes="45px"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
