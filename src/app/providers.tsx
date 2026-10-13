"use client";

import { Suspense } from "react";
import { AnimationProvider } from "@/context/AnimationContext";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollLinkedViewportSync from "@/components/ScrollLinkedViewportSync";
import HScrollTouchAssurance from "@/components/HScrollTouchAssurance";
import ScrollToTopOnNavigate from "@/components/ScrollToTopOnNavigate";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import PartnerOverlay from "@/components/PartnerOverlay";
import RathaaOverlay from "@/components/RathaaOverlay";
import EnquireOverlay from "@/components/EnquireOverlay";
import { BookingProvider } from "@/context/BookingContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <GoogleAnalytics />
      <AnimationProvider>
        <BookingProvider>
          <WishlistProvider>
            <SmoothScroll>
              <ScrollLinkedViewportSync />
              <HScrollTouchAssurance />
              <Suspense fallback={null}>
                <ScrollToTopOnNavigate />
              </Suspense>
              {children}
            </SmoothScroll>
            <PartnerOverlay />
            <RathaaOverlay />
            <EnquireOverlay />
          </WishlistProvider>
        </BookingProvider>
      </AnimationProvider>
    </MotionConfig>
  );
}
