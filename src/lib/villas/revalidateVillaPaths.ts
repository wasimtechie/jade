import { revalidatePath } from "next/cache";

/** Bust ISR + page cache after dashboard villa writes (no WebSockets — Next.js revalidation). */
export function revalidateVillaPublicPaths(opts?: {
  slug?: string;
  retreatId?: string;
}) {
  revalidatePath("/retreats/");
  revalidatePath("/book");

  const ids = new Set<string>();
  if (opts?.retreatId) ids.add(opts.retreatId);
  if (opts?.slug) ids.add(opts.slug);

  for (const id of Array.from(ids)) {
    revalidatePath(`/retreat/${id}/`);
    revalidatePath(`/retreat/${id}/spaces/`);
  }
}
