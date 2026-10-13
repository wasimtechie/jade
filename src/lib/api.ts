/**
 * API ABSTRACTION LAYER
 * All async data methods live here. Components only call this file, never data/* directly.
 * To integrate a real backend: swap the mock implementations with fetch() calls.
 * No component should ever need to change when you do that swap.
 */

import type {
  Villa,
  BookingPayload,
  BookingResponse,
  EnquiryResponse,
} from "@/lib/types";
import { VILLAS, BLOGS } from "@/lib/mockData";
import { sortVillasForDirectory } from "@/lib/villasDirectoryOrder";

// ─── Simulate async latency (remove when using real API) ─────────────────────
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ─── VILLAS ───────────────────────────────────────────────────────────────────

export async function getVillas(filters?: {
  category?: string;
}): Promise<Villa[]> {
  await delay();
  const directoryVillas = sortVillasForDirectory(
    VILLAS.filter((v) => !(v as Villa).hideFromVillasDirectory),
  );
  if (!filters?.category || filters.category === "All") {
    return directoryVillas as unknown as Villa[];
  }
  return directoryVillas.filter((v) =>
    v.categories?.some(
      (c: string) => c.toLowerCase() === filters.category!.toLowerCase(),
    ),
  ) as unknown as Villa[];
}

export async function getVillaById(id: string): Promise<Villa | null> {
  await delay(200);
  return (VILLAS.find((v) => v.id === id) as unknown as Villa) ?? null;
}

// ─── Blogs ────────────────────────────────────────────────────────────────────

export async function getBlogs() {
  await delay();
  return BLOGS;
}

export async function getBlogBySlug(slug: string) {
  await delay(200);
  return (
    BLOGS.find((b) => (b.slug ? b.slug === slug : String(b.id) === slug)) ??
    null
  );
}

// ─── Booking Submission ───────────────────────────────────────────────────────

export async function submitBooking(
  payload: BookingPayload,
): Promise<BookingResponse> {
  await delay(1200); // Simulate network latency

  // TODO: Replace with real API call:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // return res.json();

  const referenceId = `JH-${Date.now().toString(36).toUpperCase()}`;
  console.info("[API] Mock booking submitted:", payload, "→ ref:", referenceId);

  return {
    success: true,
    referenceId,
    message: "Booking request received. Our team will contact you shortly.",
  };
}

// ─── Enquiry ─────────────────────────────────────────────────────────────────

export async function submitEnquiry(data: {
  villaId?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}): Promise<EnquiryResponse> {
  await delay(800);

  // TODO: Replace with real API call
  console.info("[API] Mock enquiry submitted:", data);

  return {
    success: true,
    message: "Enquiry received. We'll be in touch soon.",
  };
}
