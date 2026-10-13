"use client";

import { useRouter } from "next/navigation";
import JadeImage from "@/components/ui/JadeImage";
import Link from "next/link";
import { Heart, MapPin, ArrowRight, Bed, Users, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import EmptyState from "@/components/ui/EmptyState";
import { VILLAS } from "@/lib/mockData";
import { getVillaGoogleMapsUrl } from "@/lib/googleMapsLinks";
import { isVillaBookable } from "@/lib/villaBooking";
import { useAnimation } from "@/context/AnimationContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, count } = useWishlist();
  const { setEnquireOverlayOpen } = useAnimation();

  return (
    <main className="min-h-screen bg-[#1A1C1E]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16 pt-24 pb-24">
        {/* Header */}
        <div className="mb-10">
          <span className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.2em] uppercase">
            YOUR SAVED RETREATS
          </span>
          <h1 className="font-philosopher text-gh-h1 text-white mt-2 leading-tight flex items-baseline gap-2.5">
            <span>Saved Villas</span>
            {count > 0 && (
              <span className="text-white/30 font-manrope text-gh-body font-normal">
                ({count})
              </span>
            )}
          </h1>
        </div>

        {/* Empty State */}
        {count === 0 && (
          <EmptyState
            icon={<Heart className="w-full h-full fill-current" />}
            headline="No saved VILLAS yet"
            subtext="Save VILLAS to compare options, revisit details, and plan your stay more easily."
            ctaLabel="EXPLORE Villas"
            onCta={() => router.push("/retreats/")}
          />
        )}

        {/* Wishlist Grid */}
        <AnimatePresence mode="popLayout">
          {count > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item, i) => {
                const matchedVilla = VILLAS.find((v) => v.id === item.id);
                
                // Fallbacks to handle cases where item fields exist but matchedVilla is undefined (highly robust)
                const name = matchedVilla?.name ?? item.name;
                const type = matchedVilla?.type ?? item.type;
                const location = matchedVilla?.location ?? item.location;
                const image = matchedVilla?.image ?? item.image;
                
                const rawStartingPrice = matchedVilla?.pricing?.stay?.packages?.[0]?.price?.split(" ")[0] ?? item.startingPrice;
                const startingPrice = rawStartingPrice ? `${rawStartingPrice} onwards` : "Upon Request";

                const mapsHref = getVillaGoogleMapsUrl(
                  matchedVilla ?? { location: item.location },
                );

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" },
                    }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                    className="relative group bg-white/[0.02] border border-white/5 hover:border-[#EFCD62]/20 hover:bg-white/[0.03] transition-all duration-300 flex flex-col h-full rounded-sm overflow-hidden shadow-md"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/5 shrink-0">
                      <JadeImage
                        src={image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      {/* Dark Overlay gradient inside image bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                      {/* Heart (Remove) button */}
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/40 backdrop-blur-md border border-white/20 hover:border-red-500 hover:bg-red-500/10 transition-all rounded-sm group/btn flex items-center justify-center"
                        aria-label={`Remove ${name} from wishlist`}
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 transition-transform group-hover/btn:scale-110" />
                      </button>
                    </div>

                    {/* Info/Content Section */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Order & Context: Category/Type -> Title -> Location -> Description -> Stats -> Price -> Actions */}
                      
                      {/* 1. Category/Type */}
                      <span className="text-[#EFCD62] text-gh-label font-manrope font-bold tracking-[0.2em] uppercase mb-1.5 block">
                        {type}
                      </span>

                      {/* 2. Title */}
                      <h3 className="font-philosopher text-gh-h3 text-white mb-2 leading-snug group-hover:text-[#EFCD62] transition-colors duration-300">
                        {name}
                      </h3>

                      {/* 3. Location */}
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-white/50 text-gh-desc font-manrope mb-3 w-fit max-w-full rounded-sm outline-none hover:text-[#EFCD62] transition-colors duration-300"
                      >
                        <MapPin className="w-4 h-4 text-[#EFCD62] shrink-0" />
                        <span className="hover:underline underline-offset-2">
                          {location}
                        </span>
                      </a>

                      {/* 4. Description */}
                      {matchedVilla?.description && (
                        <p className="font-manrope text-white/60 leading-relaxed text-gh-desc line-clamp-2 mb-3">
                          {matchedVilla.description}
                        </p>
                      )}

                      {/* 5. Stats Row (Stay, Events, BHK) */}
                      {matchedVilla?.stats && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/70 font-manrope text-gh-label border-t border-b border-white/5 py-3.5 mb-3">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Bed className="w-4 h-4 text-[#EFCD62]/80" />
                            <span>{matchedVilla.stats.stay}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Users className="w-4 h-4 text-[#EFCD62]/80" />
                            <span>{matchedVilla.stats.events}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Home className="w-4 h-4 text-[#EFCD62]/80" />
                            <span>{matchedVilla.stats.bhk}</span>
                          </div>
                        </div>
                      )}

                      {/* 6. Perfect For Tags (Limited to top 2 for grid balance) */}
                      {matchedVilla?.perfectForTags && matchedVilla.perfectForTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-gh-label font-manrope">
                          <span className="text-white/30 font-bold uppercase tracking-wider mr-1">
                            For:
                          </span>
                          {matchedVilla.perfectForTags.slice(0, 2).map((title, idx) => (
                              <span
                                key={`${title}-${idx}`}
                                className="whitespace-nowrap bg-white/5 border border-white/10 text-white/70 px-2.5 py-0.5 rounded-sm font-manrope text-[11px]"
                              >
                                {title}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* 7. Price onwards & CTA Buttons */}
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <p className="text-white/40 font-manrope text-gh-desc mb-3">
                          Starting Price: <span className="text-white font-bold ml-1">{startingPrice}</span>
                        </p>

                        <div className="flex gap-2.5">
                          <Link
                            href={`/retreat/${item.id}/`}
                            className="flex-1 border border-white/20 text-white font-manrope font-bold text-gh-label tracking-widest uppercase text-center py-2.5 hover:bg-white hover:text-black hover:border-white transition-all rounded-sm duration-300"
                          >
                            VIEW VILLA
                          </Link>
                          {isVillaBookable(item.id) ? (
                            <Link
                              href={`/book?villa=${item.id}`}
                              className="flex-1 bg-[#EFCD62] text-[#0B2C23] font-manrope font-bold text-gh-label tracking-widest uppercase text-center py-2.5 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1 rounded-sm duration-300"
                            >
                              BOOK VILLA <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEnquireOverlayOpen(true)}
                              className="flex-1 bg-[#EFCD62] text-[#0B2C23] font-manrope font-bold text-gh-label tracking-widest uppercase text-center py-2.5 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1 rounded-sm duration-300"
                            >
                              ENQUIRE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* CTA when list not empty */}
        {count > 0 && (
          <div className="mt-12 text-center border-t border-white/5 pt-8">
            <Link
              href="/retreats/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white font-manrope text-gh-body transition-all group hover:gap-2.5"
            >
              <span>Continue exploring our collection of VILLAS</span>
              <ArrowRight className="w-4 h-4 text-[#EFCD62] transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      <div className="h-24 md:hidden" />
      <MobileBottomNav />
    </main>
  );
}
