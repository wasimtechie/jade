import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";
import plugin from "tailwindcss/plugin";

/** External layout rhythm — 0.8× fluid section/gap tokens (not control padding). */
const LAYOUT_SPACE_SCALE = 0.8;
const s = (n: number) => n * LAYOUT_SPACE_SCALE;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          text: "hsla(0, 0%, 98%, 0.8)",
          // New Palette
          charcoal: "#25282C", // Primary Background
          green: "#0B2C23", // Secondary Background
          gold: "#EFCD62", // Primary Accent (Jade Gold)
          "gold-muted": "#AC8831",
          "gold-dull": "#5C4009",

          // Legacy mappings (optional, to prevent breaking)
          dark: "#25282C",
        },
      },
      fontFamily: {
        philosopher: ["var(--font-philosopher)", "sans-serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      /* ============================================================
         ZOOM-SAFE FLUID SPACING TOKENS
         Use these instead of fixed `pt-24`, `gap-8`, etc. wherever a
         section looks tight at 125–150% Windows scaling.
         e.g. pt-fluid-lg  gap-fluid-md  px-fluid-md
         ============================================================ */
      spacing: {
        "fluid-xs": `clamp(${s(4)}px, ${s(0.5)}vw, ${s(8)}px)`,
        "fluid-sm": `clamp(${s(8)}px, ${s(1)}vw, ${s(16)}px)`,
        "fluid-md": `clamp(${s(16)}px, ${s(2)}vw, ${s(32)}px)`,
        "fluid-lg": `clamp(${s(32)}px, ${s(4)}vw, ${s(64)}px)`,
        "fluid-xl": `clamp(${s(48)}px, ${s(6)}vw, ${s(96)}px)`,
        "fluid-2xl": `clamp(${s(64)}px, ${s(8)}vw, ${s(128)}px)`,
      },
      /* Dynamic viewport units — prefer over vh/vw which misbehave at
         high Windows display scaling and on mobile browser chrome. */
      height: {
        dscreen: "100dvh",
        sscreen: "100svh",
        lscreen: "100lvh",
      },
      minHeight: {
        dscreen: "100dvh",
        sscreen: "100svh",
      },
      maxHeight: {
        dscreen: "100dvh",
      },
    },
  },
  plugins: [
    containerQueries,
    plugin(({ addVariant }) => {
      addVariant(
        "supports-sda",
        "@supports (animation-timeline: auto)",
      );
    }),
  ],
};
export default config;
