"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { WishlistItem } from "@/lib/types";

interface WishlistContextProps {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(
  undefined,
);

const STORAGE_KEY = "jade_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(JSON.parse(stored));
    } catch {
      // Silently ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlist]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) =>
      prev.some((w) => w.id === item.id) ? prev : [...prev, item],
    );
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const isWishlisted = useCallback(
    (id: string) => wishlist.some((w) => w.id === id),
    [wishlist],
  );

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) =>
      prev.some((w) => w.id === item.id)
        ? prev.filter((w) => w.id !== item.id)
        : [...prev, item],
    );
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        toggleWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
