"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useBatchedScrollHide } from "@/lib/useBatchedScrollHide";
import { SCROLL_CHROME_NAV_GLASS_SHELL_CLASS } from "@/lib/scrollChromeLayout";
import { scrollChromeHideMotionProps } from "@/lib/scrollChromeMotion";

type ScrollHideTopChromeProps = {
  children: React.ReactNode;
  /** Layout / padding on the inner row (gutters, pt-* for hero inset). */
  className?: string;
  zIndex?: string;
  /** `glass` = gradient + blur (default). `transparent` = no header bar fill. */
  shellVariant?: "glass" | "transparent";
};

/**
 * Fixed top chrome — same hide/show engine, glass, and Framer motion as global Navbar.
 */
export default function ScrollHideTopChrome({
  children,
  className,
  zIndex = "z-[70]",
  shellVariant = "glass",
}: ScrollHideTopChromeProps) {
  const isHidden = useBatchedScrollHide();
  const reduceMotion = useReducedMotion();
  const motionProps = scrollChromeHideMotionProps(isHidden, reduceMotion);

  return (
    <motion.div
      className={clsx(
        "jade-nav-chrome fixed top-0 left-0 right-0 w-full",
        zIndex,
      )}
      {...motionProps}
    >
      <div
        className={
          shellVariant === "transparent"
            ? "w-full"
            : SCROLL_CHROME_NAV_GLASS_SHELL_CLASS
        }
      >
        <div
          className={clsx(
            className,
            isHidden ? "pointer-events-none" : "pointer-events-auto",
          )}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
