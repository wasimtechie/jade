"use client";

import React, { createContext, useContext, useState } from "react";
import { getExperienceEnquiryReturnPath } from "@/lib/enquiryReturnPath";

interface AnimationContextType {
  isSplashComplete: boolean;
  setSplashComplete: (value: boolean) => void;
  isPartnerOverlayOpen: boolean;
  setPartnerOverlayOpen: (value: boolean) => void;
  navbarTheme: "white" | "golden";
  setNavbarTheme: (theme: "white" | "golden") => void;
  isGlobalBookingOpen: boolean;
  setGlobalBookingOpen: (value: boolean) => void;
  villaBookingId: string | null;
  setVillaBookingId: (id: string | null) => void;
  isRathaaOverlayOpen: boolean;
  setRathaaOverlayOpen: (value: boolean) => void;
  isEnquireOverlayOpen: boolean;
  /** Pass experience page path when opening from a CTA (e.g. `/weekend-getaways`). */
  setEnquireOverlayOpen: (open: boolean, returnPath?: string) => void;
  enquireReturnPath: string | null;
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined,
);

export const AnimationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSplashComplete, setSplashComplete] = useState(false);
  const [isPartnerOverlayOpen, setPartnerOverlayOpen] = useState(false);
  const [navbarTheme, setNavbarTheme] = useState<"white" | "golden">("golden");
  const [isGlobalBookingOpen, setGlobalBookingOpen] = useState(false);
  const [villaBookingId, setVillaBookingId] = useState<string | null>(null);
  const [isRathaaOverlayOpen, setRathaaOverlayOpen] = useState(false);
  const [isEnquireOverlayOpen, setIsEnquireOverlayOpen] = useState(false);
  const [enquireReturnPath, setEnquireReturnPath] = useState<string | null>(
    null,
  );

  const setEnquireOverlayOpen = (open: boolean, returnPath?: string) => {
    if (!open) {
      setIsEnquireOverlayOpen(false);
      setEnquireReturnPath(null);
      return;
    }

    const captured =
      returnPath ??
      (typeof window !== "undefined"
        ? getExperienceEnquiryReturnPath(
            window.location.pathname,
            window.location.search,
          )
        : null);
    setEnquireReturnPath(captured);
    setIsEnquireOverlayOpen(true);
  };

  return (
    <AnimationContext.Provider
      value={{
        isSplashComplete,
        setSplashComplete,
        isPartnerOverlayOpen,
        setPartnerOverlayOpen,
        navbarTheme,
        setNavbarTheme,
        isGlobalBookingOpen,
        setGlobalBookingOpen,
        villaBookingId,
        setVillaBookingId,
        isRathaaOverlayOpen,
        setRathaaOverlayOpen,
        isEnquireOverlayOpen,
        setEnquireOverlayOpen,
        enquireReturnPath,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};
