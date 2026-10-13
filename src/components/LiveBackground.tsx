"use client";

import { motion } from "framer-motion";

/** Static gradients only — compositor-friendly for Lenis + scroll-linked motion (60fps). */
function LiveBackgroundStatic() {
  return (
    <div className="absolute inset-0 bg-transparent overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_25%,rgba(239,205,98,0.2)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(100,180,220,0.15)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(180,120,200,0.12)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(239,205,98,0.15)] via-transparent to-[rgba(100,180,220,0.1)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.02)] to-transparent" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[rgba(239,205,98,0.04)] to-transparent"
          style={{ height: "25%" }}
        />
      </div>
    </div>
  );
}

export default function LiveBackground({
  variant = "full",
}: {
  /** `static` — no infinite motion (weddings / Lenis pages). */
  variant?: "full" | "static";
}) {
  if (variant === "static") {
    return <LiveBackgroundStatic />;
  }

  return (
    <div className="absolute inset-0 bg-transparent overflow-hidden">
      <div className="absolute inset-0">
        {/* Multi-colored gemstone glow effects - Increased opacity */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_25%,rgba(239,205,98,0.2)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(100,180,220,0.15)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(180,120,200,0.12)_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(239,205,98,0.15)] via-transparent to-[rgba(100,180,220,0.1)]" />

        {/* Floating animated gems (ROUND SHAPES) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Green Round Gem 1 */}
          <motion.svg
            className="absolute w-[40px] h-[40px] opacity-30"
            style={{ left: "10%", top: "15%" }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="rgba(100,180,120,0.06)"
              stroke="rgba(100,180,120,0.2)"
              strokeWidth="1"
            />
            <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.4)" />
          </motion.svg>

          {/* Yellow Round Gem 2 */}
          <motion.svg
            className="absolute w-[50px] h-[50px] opacity-35"
            style={{ right: "15%", top: "20%" }}
            animate={{
              y: [0, 25, 0],
              x: [0, -15, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="rgba(239,205,98,0.05)"
              stroke="rgba(239,205,98,0.25)"
              strokeWidth="1.2"
            />
            <circle cx="25" cy="25" r="3" fill="rgba(255,255,255,0.45)" />
          </motion.svg>

          {/* Blue Round Gem 3 */}
          <motion.svg
            className="absolute w-[45px] h-[45px] opacity-32"
            style={{ left: "25%", top: "60%" }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [45, 52, 45],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <circle
              cx="22.5"
              cy="22.5"
              r="18"
              fill="rgba(100,150,220,0.06)"
              stroke="rgba(100,150,220,0.22)"
              strokeWidth="1"
            />
            <circle cx="22.5" cy="22.5" r="2" fill="rgba(200,220,255,0.4)" />
          </motion.svg>

          {/* Purple Round Gem 4 */}
          <motion.svg
            className="absolute w-[30px] h-[30px] opacity-28"
            style={{ right: "20%", top: "65%" }}
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5,
            }}
          >
            <circle
              cx="15"
              cy="15"
              r="8"
              fill="rgba(180,120,200,0.12)"
              stroke="rgba(180,120,200,0.2)"
              strokeWidth="1"
            />
            <circle cx="15" cy="15" r="1.5" fill="rgba(255,255,255,0.35)" />
          </motion.svg>

          {/* Green Round Gem 5 */}
          <motion.svg
            className="absolute w-[35px] h-[35px] opacity-30"
            style={{ left: "70%", top: "35%" }}
            animate={{
              y: [0, -25, 0],
              x: [0, 12, 0],
              rotate: [0, -6, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          >
            <circle
              cx="17.5"
              cy="17.5"
              r="12"
              fill="rgba(100,180,120,0.08)"
              stroke="rgba(100,180,120,0.22)"
              strokeWidth="1"
            />
            <circle cx="17.5" cy="17.5" r="1.8" fill="rgba(255,255,255,0.4)" />
          </motion.svg>

          {/* Yellow Round Gem 6 */}
          <motion.svg
            className="absolute w-[25px] h-[25px] opacity-32"
            style={{ right: "35%", top: "45%" }}
            animate={{
              y: [0, 18, 0],
              x: [0, -8, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            <circle
              cx="12.5"
              cy="12.5"
              r="7"
              fill="rgba(239,205,98,0.08)"
              stroke="rgba(239,205,98,0.22)"
              strokeWidth="0.9"
            />
            <circle cx="12.5" cy="12.5" r="1.2" fill="rgba(255,255,255,0.4)" />
          </motion.svg>

          {/* White Sparkle effects (Increased Count: 25) */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{
                // Deterministic positions
                left: `${(i * 13) % 100}%`,
                top: `${(i * 29) % 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2 + (i % 3), // Faster twinkle
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Golden Particles (Subtle) (Increased Count: 40) */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`gold-${i}`}
              className="absolute w-[2px] h-[2px] rounded-full bg-[#EFCD62] shadow-[0_0_5px_rgba(239,205,98,0.6)]"
              style={{
                // Deterministic random-like positions based on index
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
              }}
              animate={{
                y: [0, -40, 0], // Slightly more movement
                opacity: [0, 0.8, 0],
                scale: [0, 2, 0],
              }}
              transition={{
                duration: 3 + (i % 5), // Varied duration
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.02)] to-transparent" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[rgba(239,205,98,0.04)] to-transparent"
          style={{ height: "25%" }}
        />
      </div>
    </div>
  );
}
