/**
 * MOCK DATA — Single import point for all static data.
 * Components and api.ts MUST import from here, NOT from @/data/* directly.
 * When the real backend is ready, replace this file's exports with API calls.
 */

export { VILLAS, CATEGORIES } from "@/data/retreats";
export { BLOG_POSTS as BLOGS } from "@/data/blogs";

// ─── Hardcoded booking constants (currently duplicated in 2 files) ───────────
export const UNAVAILABLE_DATES: Record<string, number[]> = {
  "January 2026": [7, 8, 9],
  "February 2026": [7, 8, 9, 10],
  "March 2026": [],
  "April 2026": [1, 2, 3, 4, 5, 18, 19, 20],
};

export const BOOKING_MONTHS = [
  { name: "January 2026", year: 2026, month: 0, days: 31, startDay: 3 },
  { name: "February 2026", year: 2026, month: 1, days: 28, startDay: 0 },
  { name: "March 2026", year: 2026, month: 2, days: 31, startDay: 0 },
  { name: "April 2026", year: 2026, month: 3, days: 30, startDay: 2 },
];

export const ADD_ON_EXPERIENCES = [
  { id: "bonfire", label: "Bonfire Setup", price: 9900 },
  { id: "bbq", label: "Private BBQ Experience", price: 12000 },
  { id: "movie", label: "Movie Under the Stars", price: 8000 },
  { id: "candle", label: "Candle-Lit Dinner", price: 15000 },
  { id: "dj", label: "DJ & Sound Setup", price: 20000 },
  { id: "wellness", label: "Guided Wellness Session", price: 6000 },
  { id: "culinary", label: "Culinary Experience", price: 0 },
];
