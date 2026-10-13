"use client";

import { useEffect, useState } from "react";
import { Waves, Warehouse, Menu, LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimation } from "@/context/AnimationContext";
import { GLASS_INNER_SURFACE } from "@/lib/glassChrome";

interface NavItem {
  label: string;
  type?: "logo";
  icon?: LucideIcon;
  href: string;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const {
    isSplashComplete,
    isPartnerOverlayOpen,
    isEnquireOverlayOpen,
    isRathaaOverlayOpen,
    isGlobalBookingOpen,
  } = useAnimation();
  const [venueOverlayOpen, setVenueOverlayOpen] = useState(false);

  useEffect(() => {
    const sync = () =>
      setVenueOverlayOpen(
        document.body.hasAttribute("data-jade-overlay-open"),
      );
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-jade-overlay-open"],
    });
    return () => obs.disconnect();
  }, []);

  const hideForOverlay =
    isPartnerOverlayOpen ||
    isEnquireOverlayOpen ||
    isRathaaOverlayOpen ||
    isGlobalBookingOpen ||
    venueOverlayOpen;

  const navItems: NavItem[] = [
    {
      label: "Home",
      type: "logo",
      href: "/",
    },
    {
      label: "Experiences",
      icon: Waves,
      href: "/experiences",
    },
    {
      label: "Retreats",
      icon: Warehouse,
      href: "/retreats/",
    },
    {
      label: "Menu",
      icon: Menu,
      href: "/menu",
    },
  ];

  return (
    <AnimatePresence>
      {(isSplashComplete || pathname !== "/") && !hideForOverlay && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`jade-mobile-bottom-nav jade-scroll-chrome lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/15 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.875rem))] ${GLASS_INNER_SURFACE}`}
        >
          <div className="flex items-center justify-around px-1">
            {navItems.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href === "/" && pathname === "/");
              const colorClass = isActive ? "text-jade-gold" : "text-[#9CA3AF]";

              if (item.type === "logo") {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex flex-col items-center justify-center min-h-[44px] p-2 gap-1.5 w-16 ${colorClass}`}
                  >
                    <div
                      className={`relative w-5 h-5 ${isActive ? "" : "opacity-50 grayscale"}`}
                    >
                      <Image
                        src="/assets/Golden_Logo.png"
                        alt="Home"
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-gh-label font-manrope font-medium tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              const Icon = item.icon || Warehouse;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center gap-1.5 w-16 ${colorClass}`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-gh-label font-manrope font-medium tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
