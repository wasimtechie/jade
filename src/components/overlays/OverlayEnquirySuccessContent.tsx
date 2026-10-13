"use client";

import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import { OVERLAY_MOBILE_ACTION_BAR_PB_CLASS } from "@/lib/overlayMobileChrome";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/jadehospitainment/" },
  { Icon: Instagram, href: "https://www.instagram.com/jadehospitainment/?hl=en" },
  { Icon: Youtube, href: "https://www.youtube.com/@jade_hospitainment" },
] as const;

/** Equal top/bottom inset — open breathable shell (ref. Know More success). */
const SUCCESS_SHEET_INSET_CLASS =
  "py-[max(3rem,env(safe-area-inset-bottom,0px))] md:py-12";

export type OverlayEnquirySuccessContentProps = {
  onOkay: () => void;
  /** Embedded in FormOverlayLayout — no extra chrome padding */
  embedded?: boolean;
};

function SuccessMedal() {
  return (
    <div className="relative mx-auto flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-full">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
        aria-hidden
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
        aria-hidden
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: 6,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-hidden
      />
      <div className="relative h-[84px] w-[84px] shrink-0 drop-shadow-2xl">
        <Image
          src="/assets/JAde%20Correction.png"
          alt="Success"
          fill
          sizes="96px"
          quality={100}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

/** Shared success body — Partner / Know More / venue enquiry parity */
export default function OverlayEnquirySuccessContent({
  onOkay,
  embedded = false,
}: OverlayEnquirySuccessContentProps) {
  return (
    <div
      className={`flex min-h-full w-full flex-col items-center justify-center px-6 text-center font-manrope md:px-8 ${
        embedded
          ? SUCCESS_SHEET_INSET_CLASS
          : `${SUCCESS_SHEET_INSET_CLASS} ${OVERLAY_MOBILE_ACTION_BAR_PB_CLASS}`
      }`}
    >
      <div className="flex w-full flex-col items-center gap-10 md:gap-9">
        <SuccessMedal />

        <div className="flex max-w-sm flex-col gap-4">
          <h2
            id="overlay-success-title"
            className="font-philosopher text-gh-h1 text-white text-shadow-sm"
          >
            We&apos;ve got it from here
          </h2>

          <p className="text-gh-body leading-relaxed text-white/90">
            Thanks for sharing your details!
            <br />
            Our team will take a look and reach out shortly to understand things
            better.
          </p>
        </div>

        <div className="flex w-full max-w-[280px] flex-col items-center gap-6">
          <p className="text-gh-label font-bold tracking-[0.2em] uppercase text-white/60">
            MEANWHILE CHECK US OUT HERE
          </p>

          <div className="flex justify-center gap-3">
            {SOCIAL_LINKS.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 w-12 items-center justify-center border border-white/20 bg-white/5 transition-all hover:border-[#EFCD62] hover:bg-[#EFCD62]"
              >
                <Icon className="h-5 w-5 text-white/50 transition-colors group-hover:text-black" />
              </a>
            ))}
          </div>

          <p className="text-gh-label italic text-white/50">
            Thoughtfully operated. Always.
          </p>
        </div>

        <PrimaryButton
          withArrow={false}
          width="form"
          onClick={onOkay}
        >
          OKAY
        </PrimaryButton>
      </div>
    </div>
  );
}
