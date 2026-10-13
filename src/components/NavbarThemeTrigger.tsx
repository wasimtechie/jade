"use client";

import { useEffect } from "react";
import { useInView } from "framer-motion";
import { useAnimation } from "@/context/AnimationContext";

interface NavbarThemeTriggerProps {
  theme: "white" | "golden";
  sectionRef: React.RefObject<HTMLElement | HTMLDivElement | null>;
}

/**
 * NavbarThemeTrigger
 *
 * Place this inside a section to automatically update the Navbar's logo theme
 * when that section reaches the top of the viewport.
 */
export default function NavbarThemeTrigger({
  theme,
  sectionRef,
}: NavbarThemeTriggerProps) {
  const { navbarTheme, setNavbarTheme } = useAnimation();

  const isInView = useInView(sectionRef, {
    margin: "-10% 0px -85% 0px",
  });

  useEffect(() => {
    if (isInView && navbarTheme !== theme) {
      setNavbarTheme(theme);
    }
  }, [isInView, theme, navbarTheme, setNavbarTheme]);

  return null;
}
