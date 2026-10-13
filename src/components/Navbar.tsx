"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useBatchedScrollHide } from "@/lib/useBatchedScrollHide";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useAnimation } from "@/context/AnimationContext";
import { useWishlist } from "@/context/WishlistContext";
import CallToEnquireLink from "@/components/ui/CallToEnquireLink";
import PrimaryButton from "@/components/PrimaryButton";
import {
  NAVBAR_ACTIONS_CLUSTER_CLASS,
  NAVBAR_BOOK_BUTTON_CLASS,
  NAVBAR_CHROME_TEXT_BUTTON_CLASS,
  NAVBAR_GLASS_ICON_CLASS,
  NAVBAR_WISHLIST_ICON_CLASS,
} from "@/lib/navbarChrome";
import { scrollChromeHideMotionProps } from "@/lib/scrollChromeMotion";
import { useMediaMinLg } from "@/lib/useMediaMinLg";

const NAV_HEADSET_ICON = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-colors drop-shadow-sm"
    aria-hidden
  >
    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3V11z" />
    <path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3v-7z" />
    <path d="M3 11V9a9 9 0 0 1 18 0v2" />
    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
    <path d="M9 10h6v4H9z" />
    <path d="M10 12h.01M12 12h.01M14 12h.01" />
  </svg>
);

/**
 * Crossfade logo — both gold + white are mounted and preloaded, and we fade opacity
 * between them on theme change. Swapping a single <Image src> instead causes a load
 * flash; stacked crossfade is flicker-free and reads as a premium transition.
 */
function NavbarLogo({
  theme,
  className,
  sizes,
}: {
  theme: "white" | "golden";
  className: string;
  sizes: string;
}) {
  const isWhite = theme === "white";
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/assets/Golden_Logo.png"
        alt="Jade Hospitainment"
        fill
        priority
        sizes={sizes}
        className={`object-contain transition-opacity duration-300 ease-out ${isWhite ? "opacity-0" : "opacity-100"}`}
      />
      <Image
        src="/assets/White_Logo.png"
        alt=""
        aria-hidden
        fill
        priority
        sizes={sizes}
        className={`object-contain transition-opacity duration-300 ease-out ${isWhite ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const { isSplashComplete, navbarTheme } = useAnimation();
  const { count: wishlistCount } = useWishlist();
  const isHidden = useBatchedScrollHide();
  const reduceMotion = useReducedMotion();
  const isLg = useMediaMinLg();
  const chromeMotion = scrollChromeHideMotionProps(isHidden, reduceMotion, {
    fast: !isLg,
  });

  const { scrollYProgress } = useScroll();
  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.002,
  });
  /** Mobile: direct progress (no spring lag). Desktop: smoothed spring. */
  const scaleX = isLg ? progressSpring : scrollYProgress;

  // Only hide navbar on home page if splash isn't complete
  if (pathname === "/" && !isSplashComplete) return null;

  // Check if it's a detail page for VILLAS or weddings (resorts)
  const isDetailPage = /^\/(?:retreat|weddings)\/[^/]+\/?$/.test(pathname);
  const isMenuPage = pathname === "/menu";

  return (
    <>
      {/* Scroll Progress Line ("Filler Line") - LOCKED TO TOP */}
      <div className="fixed top-0 left-0 right-0 h-[2px] w-full z-[60] bg-white/5">
        <motion.div
          className="h-full bg-jade-gold origin-left"
          style={{ scaleX }}
        />
      </div>

      {/* ═══════════════════════════════════════════
           NAVBAR
      ══════════════════════════════════════════ */}
      <motion.nav
        className="jade-nav-chrome fixed top-0 left-0 w-full z-50 mt-[4px]"
        {...chromeMotion}
      >
        {/* Glass bar — menu uses flat chrome (no gradient bleed onto #1E2023 body) */}
        <div
          className={
            isMenuPage
              ? "w-full border-b border-white/10 bg-[#1E2023]"
              : "w-full bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm"
          }
        >
          <div className="jade-nav-inner mx-auto flex max-w-[1920px] items-center justify-between relative py-2.5 md:py-3">
          {/* ── LEFT: Menu link + inline nav links (desktop only) ── */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            <Link
              href="/menu"
              className="flex items-center gap-2 text-white/60 hover:text-jade-gold transition-colors group p-2 min-h-[44px]"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className="flex flex-col gap-[4px] w-5">
                  <span className="block h-[1px] w-5 bg-current transition-all" />
                  <span className="block h-[1px] w-3 bg-current transition-all group-hover:w-5" />
                </span>
              </div>
              <span className="text-gh-label font-manrope tracking-[0.25em] uppercase">
                Menu
              </span>
            </Link>

            {/* Thin divider */}
            <span className="h-4 w-px bg-white/15" />

            {/* Inline nav links */}
            <nav className="flex items-center gap-6">
              {[
                { name: "Experiences", href: "/experiences" },
                { name: "Retreats", href: "/retreats/" },
                { name: "About", href: "/about" },
                { name: "Careers", href: "/careers" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-gh-label font-manrope tracking-[0.18em] uppercase transition-colors p-2 min-h-[44px] flex items-center ${ pathname.replace(/\/+$/, "") === item.href.replace(/\/+$/, "") ? "text-jade-gold" : "text-white/55 hover:text-white" }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── MOBILE LEFT: Logo ── */}
          <div className="lg:hidden flex items-center">
            <Link href="/" aria-label="Jade home">
              <NavbarLogo theme={navbarTheme} className="w-9 h-9" sizes="36px" />
            </Link>
          </div>

          {/* ── CENTER: Logo — absolute center on desktop ── */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center">
            <Link
              href="/"
              aria-label="Jade home"
              className="block transition-opacity hover:opacity-80"
            >
              <NavbarLogo
                theme={navbarTheme}
                className="h-11 w-11 lg:h-12 lg:w-12"
                sizes="56px"
              />
            </Link>
          </div>

          {/* ── RIGHT: Contact CTA ── */}
          <div className="flex items-center justify-end flex-1 gap-3">
            {isDetailPage ? (
              <Link href="/book" className={NAVBAR_CHROME_TEXT_BUTTON_CLASS}>
                BOOK NOW
              </Link>
            ) : isMenuPage ? (
              <>
                {/* Mobile & tablet — phone call, wishlist, gold BOOK */}
                <div className={`${NAVBAR_ACTIONS_CLUSTER_CLASS} lg:hidden`}>
                  <CallToEnquireLink
                    className={NAVBAR_GLASS_ICON_CLASS}
                    ariaLabel="Call to enquire"
                    title="Call us"
                  />
                  <Link
                    href="/wishlist"
                    className={NAVBAR_WISHLIST_ICON_CLASS}
                    aria-label="Wishlist"
                  >
                    <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <PrimaryButton
                    href="/book"
                    withArrow={false}
                    size="chrome"
                    className={NAVBAR_BOOK_BUTTON_CLASS}
                  >
                    BOOK
                  </PrimaryButton>
                </div>
                {/* Desktop — headset contact, wishlist, gold BOOK */}
                <div className={`${NAVBAR_ACTIONS_CLUSTER_CLASS} hidden lg:flex`}>
                  <Link
                    href="/contact"
                    className={NAVBAR_GLASS_ICON_CLASS}
                    aria-label="Contact us"
                    title="Contact"
                  >
                    {NAV_HEADSET_ICON}
                  </Link>
                  <Link
                    href="/wishlist"
                    className={NAVBAR_WISHLIST_ICON_CLASS}
                    aria-label="Wishlist"
                  >
                    <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <PrimaryButton
                    href="/book"
                    withArrow={false}
                    size="chrome"
                    className={NAVBAR_BOOK_BUTTON_CLASS}
                  >
                    BOOK
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <div className={NAVBAR_ACTIONS_CLUSTER_CLASS}>
                {/* Phone: mobile & tablet → call; desktop → contact */}
                <CallToEnquireLink className={`${NAVBAR_GLASS_ICON_CLASS} lg:hidden`} />
                  <Link
                    href="/contact"
                    className={`${NAVBAR_GLASS_ICON_CLASS} hidden lg:flex`}
                    aria-label="Contact us"
                    title="Contact"
                  >
                    {NAV_HEADSET_ICON}
                  </Link>

                {/* Wishlist icon with badge */}
                <Link
                  href="/wishlist"
                  className={NAVBAR_WISHLIST_ICON_CLASS}
                  aria-label="Wishlist"
                >
                  <Heart className="w-[18px] h-[18px]" strokeWidth={1.25} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                {pathname?.startsWith("/experiences") ? (
                  <Link href="/book" className={NAVBAR_CHROME_TEXT_BUTTON_CLASS}>
                    BOOK NOW
                  </Link>
                ) : (
                  <PrimaryButton
                    href="/book"
                    withArrow={false}
                    size="chrome"
                    className={NAVBAR_BOOK_BUTTON_CLASS}
                  >
                    BOOK
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
