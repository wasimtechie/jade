"use client";

import React from "react";

const LOGOS = [
  {
    id: "google",
    name: "Google",
    type: "text",
    style: "font-manrope text-gh-h3 font-bold",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    type: "text",
    style: "font-manrope text-gh-h3 font-bold",
  },
  { id: "lt", name: "L&T", type: "custom-lt" },
  {
    id: "ibm",
    name: "IBM",
    type: "text",
    style: "font-manrope text-gh-h2 font-bold tracking-tighter",
  },
  {
    id: "capgemini",
    name: "Capgemini",
    type: "text",
    style: "font-manrope text-gh-h3 font-bold",
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    type: "text",
    style: "font-philosopher text-gh-h3",
  },
];

export default function TrustedBySection() {
  return (
    <section className="jade-section flex flex-col items-center justify-center bg-[#1A1C1E]">
      <div className="max-w-4xl mx-auto px-8 text-center w-full">
        <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-3">
          TRUSTED BY
        </p>
        <h2 className="text-gh-h1 font-philosopher text-white mb-16 leading-tight">
          World-Class <br /> Organizations
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 text-center">
          {LOGOS.map((logo) => (
            <div
              key={logo.id}
              className="bg-[#1E2023] aspect-square flex items-center justify-center p-8 group border border-white/5 rounded-sm transition-all duration-300 hover:border-[#EFCD62]/30"
            >
              {logo.type === "text" ? (
                <span
                  className={`text-white ${logo.style} opacity-40 group-hover:opacity-100 transition-opacity`}
                >
                  {logo.name}
                </span>
              ) : logo.id === "lt" ? (
                <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:border-[#EFCD62]/40 transition-all">
                  <span className="text-white font-manrope text-gh-h3 font-bold italic">
                    L&T
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
