"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import JadeImage from "@/components/ui/JadeImage";
import {
  Bed,
  Users,
  Home,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import type { Villa } from "@/lib/types";
import PrimaryButton from "@/components/PrimaryButton";
import { JADE_BTN_HEIGHT } from "@/lib/jadeButtonTokens";
import { useBooking } from "@/context/BookingContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAnimation } from "@/context/AnimationContext";
import { isVillaRecordBookable } from "@/lib/villaBooking";
import { useVillaListingImages } from "@/lib/useVillaListingImages";
import {
  heroSplitCardVariants,
  type HeroSplitCustom,
} from "@/lib/heroSplitCarouselVariants";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import { usePreloadNeighborImages } from "@/lib/carouselMotion";
import CarouselSwipeLayer from "@/components/ui/CarouselSwipeLayer";
import {
  bookPath,
  rememberListingReturn,
  villaDetailPath,
} from "@/lib/appRoutes";

interface VillaCardProps {
  villa: Villa;
}

export default function VillaCard({ villa }: VillaCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();
  const { dateRange, guests } = useBooking();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { setEnquireOverlayOpen } = useAnimation();
  const bookable = isVillaRecordBookable(villa);
  const { images } = useVillaListingImages(villa);

  const wishlisted = isWishlisted(villa.id);
  const reducedMotion = useReducedMotion();

  const carouselCustom: HeroSplitCustom = {
    dir: direction,
    lowFx: !!reducedMotion,
  };

  const wishlistItem = {
    id: villa.id,
    name: villa.name,
    type: villa.type,
    location: villa.location,
    image: villa.image,
    startingPrice:
      villa.pricing?.stay?.packages?.[0]?.price?.split(" ")[0] ?? null,
  };

  const bookHref = (() => {
    const hasDates = dateRange.checkIn && dateRange.checkOut;
    const hasGuests = guests.adults > 0;
    const base = bookPath(villa.id);
    return hasDates && hasGuests ? `${base}&step=details` : base;
  })();

  const validImage = (img: string | undefined) => img && img.length > 0;

  useEffect(() => {
    if (currentImageIndex < images.length) return;
    setCurrentImageIndex(0);
  }, [images.length, currentImageIndex]);

  const nextImage = () => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentSpace = images[currentImageIndex];

  const imageUrls = useMemo(
    () => images.map((i) => i.image).filter((img) => validImage(img)),
    [images],
  );
  usePreloadNeighborImages(imageUrls, currentImageIndex);

  // Helper to extract the lowest price string if available
  const getStartingPrice = () => {
    if (villa.pricing?.stay?.packages?.[0]?.price) {
      return villa.pricing.stay.packages[0].price.split(" ")[0]; // Just grab "₹43,500"
    }
    return null;
  };
  const startingPrice = getStartingPrice();

  return (
    <motion.div className="pointer-events-auto flex w-full flex-col gap-4 md:flex-row md:items-stretch md:gap-6 lg:gap-8">
      {/* IMAGE CONTAINER — wider aspect + max height so listing cards do not dominate the viewport */}
      <div
        className="relative w-full md:w-[45%] md:flex-shrink-0 aspect-[16/9] md:aspect-auto md:min-h-[min(360px,42dvh)] md:max-h-[min(360px,42dvh)] overflow-hidden rounded-md group bg-white/5"
        style={{ perspective: "1400px" }}
      >
        <AnimatePresence mode="sync" initial={false} custom={carouselCustom}>
          <motion.div
            key={`${villa.id}-${currentImageIndex}`}
            custom={carouselCustom}
            variants={heroSplitCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "transform" }}
          >
            {validImage(currentSpace?.image) ? (
              <JadeImage
                src={currentSpace.image}
                alt={`${villa.name} - ${currentSpace.name}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority={currentImageIndex === 0}
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
              />
            ) : (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">
                Image Coming Soon
              </div>
            )}
            {/* Dark gradient overlay for bottom text */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        <CarouselSwipeLayer
          onPrev={prevImage}
          onNext={nextImage}
          slideCount={images.length}
          className="absolute inset-0 z-[8] touch-pan-y cursor-grab active:cursor-grabbing"
        />

        {/* WISHLIST HEART */}
        <button
          onClick={() => toggleWishlist(wishlistItem)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/20 hover:border-white/60 transition-colors rounded-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${ wishlisted ? "fill-red-400 text-red-400" : "text-white/70" }`}
          />
        </button>

        {/* Slide label + carousel controls — label always visible (mobile + desktop) */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-10 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
          {images.length > 1 ? (
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="pointer-events-auto shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          ) : (
            <span className="shrink-0 w-10 h-10 md:w-12 md:h-12" aria-hidden />
          )}

          <p
            className="flex-1 min-w-0 px-0.5 sm:px-1 text-center text-white text-gh-label font-manrope font-bold tracking-[0.2em] sm:tracking-widest uppercase line-clamp-2 break-words [overflow-wrap:anywhere]"
            title={currentSpace.name || "VIEW"}
          >
            {currentSpace.name || "VIEW"}
          </p>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="pointer-events-auto shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors rounded-sm"
            >
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          ) : (
            <span className="shrink-0 w-10 h-10 md:w-12 md:h-12" aria-hidden />
          )}
        </div>
      </div>

      {/* DETAILS — footer row pinned to bottom on md+ to align with image column */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3.5 text-left max-md:pr-1 md:min-h-[min(360px,42dvh)] md:gap-4 md:py-1 md:pl-1 md:pr-8 lg:pr-10 xl:pr-12">
        <div className="flex flex-col gap-3.5 md:gap-4">
          <div className="flex flex-col gap-2 md:gap-2.5">
            <span className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.2em] uppercase">
              {villa.type}
            </span>
            <h2 className="font-philosopher text-gh-h2 text-white leading-snug">
              {villa.name}
            </h2>
            <a
              href={getVillaGoogleMapsUrl(villa)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 w-fit max-w-full rounded-sm outline-none hover:text-[#EFCD62] transition-colors focus-visible:ring-2 focus-visible:ring-[#EFCD62]/55"
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="font-manrope text-gh-body hover:underline underline-offset-4">
                {villa.location}
              </span>
            </a>

            {villa.description?.trim() ? (
              <p className="font-manrope text-white/70 leading-relaxed text-gh-desc line-clamp-3">
                {villa.description}
              </p>
            ) : null}
          </div>

          {/* Stats Row */}
          <div
            data-jade-hscroll
            className="jade-hscroll-track flex flex-nowrap overflow-x-auto items-center gap-x-4 scroll-pr-6 md:scroll-pr-8 text-white/80 font-manrope text-gh-label [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
          >
            <div className="flex shrink-0 items-center gap-2">
              <Bed className="w-4 h-4 text-[#EFCD62]" />
              <span className="whitespace-nowrap">{villa.stats.stay}</span>
            </div>
            <div className="shrink-0 w-1 h-1 rounded-full bg-white/20" />
            <div className="flex shrink-0 items-center gap-2">
              <Users className="w-4 h-4 text-[#EFCD62]" />
              <span className="whitespace-nowrap">{villa.stats.events}</span>
            </div>
            <div className="shrink-0 w-1 h-1 rounded-full bg-white/20" />
            <div className="flex shrink-0 items-center gap-2">
              <Home className="w-4 h-4 text-[#EFCD62]" />
              <span className="whitespace-nowrap">{villa.stats.bhk}</span>
            </div>
            {"lawn" in villa.stats && (villa.stats as any).lawn && (
              <>
                <div className="shrink-0 w-1 h-1 rounded-full bg-white/20" />
                <span className="shrink-0 whitespace-nowrap">
                  {(villa.stats as any).lawn}
                </span>
              </>
            )}
          </div>

          {/* Perfect For Tags */}
          <div
            data-jade-hscroll
            className="jade-hscroll-track flex flex-nowrap overflow-x-auto items-center gap-2 scroll-pr-6 md:scroll-pr-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
          >
            <span className="shrink-0 text-white/40 text-gh-label font-manrope font-bold uppercase tracking-wider mr-1">
              Perfect for:
            </span>
            {(villa.perfectForTags ?? []).map((title, idx) => (
                <span
                  key={`${title}-${idx}`}
                  className="shrink-0 whitespace-nowrap bg-white/5 border border-white/10 text-white/80 text-gh-label px-2.5 py-1 rounded-sm font-manrope"
                >
                  {title}
                </span>
              ))}
          </div>
        </div>

        {/* Action Row — price + CTAs fixed at card bottom */}
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-4 pt-2 md:pt-4">
          {/* Price: stacked on mobile, single line from md up */}
          <div className="flex min-w-0 shrink-0 flex-col md:flex-row md:items-baseline md:gap-1.5">
            <span className="text-white font-manrope font-bold text-gh-villa-footer-row tracking-wide leading-tight">
              {startingPrice || "Upon Request"}
            </span>
            <span className="text-white/80 font-manrope font-normal text-gh-villa-footer-row tracking-wide leading-tight md:font-bold md:text-white">
              onwards
            </span>
          </div>

          {/* Buttons — standard CTA height; compact width profile */}
          <div
            className={`flex shrink-0 items-stretch justify-end gap-2 md:gap-2.5 ${JADE_BTN_HEIGHT}`}
          >
            <Link
              href={`${villaDetailPath(villa.id)}?autoScroll=true`}
              onClick={() => rememberListingReturn()}
              className="h-full inline-flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-colors px-3 md:px-5 font-manrope font-bold text-gh-villa-footer-row tracking-widest uppercase text-center rounded-sm whitespace-nowrap"
            >
              VIEW VILLA
            </Link>
            {bookable ? (
              <PrimaryButton
                width="compact"
                withArrow={false}
                onClick={() => router.push(bookHref)}
                className="h-full text-gh-villa-footer-row"
              >
                BOOK VILLA
              </PrimaryButton>
            ) : (
              <PrimaryButton
                width="compact"
                withArrow={false}
                onClick={() => setEnquireOverlayOpen(true)}
                className="h-full text-gh-villa-footer-row"
              >
                ENQUIRE
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
