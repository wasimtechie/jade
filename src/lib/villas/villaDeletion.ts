import { VILLAS as STATIC_RETREATS } from "@/data/retreats";
import { BookingModel } from "@/models/Booking";
import { VillaBlockModel } from "@/models/VillaBlock";
import { VillaNightlockModel } from "@/models/VillaNightlock";
import { VillaModel } from "@/models/Villa";

const LOCKED_PORTFOLIO_SOURCES = new Set(["canonical", "legacy", "coming_soon"]);

const ACTIVE_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "on_hold",
  "conflict",
] as const;

export type VillaDeletionInput = {
  slug: string;
  retreatId?: string | null;
  portfolioSource?: string | null;
};

export type VillaDeletionAssessment = {
  allowed: boolean;
  reason?: string;
};

/** Whether dashboard may remove this Mongo villa record. */
export function assessVillaDeletion(
  villa: VillaDeletionInput,
): VillaDeletionAssessment {
  const retreatId = villa.retreatId ?? villa.slug;
  const source = villa.portfolioSource ?? "canonical";
  const inStaticCatalog = STATIC_RETREATS.some((v) => v.id === retreatId);

  if (inStaticCatalog && LOCKED_PORTFOLIO_SOURCES.has(source)) {
    return {
      allowed: false,
      reason:
        "This property is part of the Jade portfolio catalogue and cannot be deleted. Set visibility to Hidden to remove it from the website.",
    };
  }

  return { allowed: true };
}

export async function countActiveBookingsForVilla(
  villaId: unknown,
): Promise<number> {
  return BookingModel.countDocuments({
    villaId,
    isDeleted: false,
    status: { $in: ACTIVE_BOOKING_STATUSES },
  });
}

/** Soft-delete villa + related blocks; nightlocks are removed. */
export async function softDeleteVillaRecord(
  villa: { _id: unknown; slug: string; retreatId?: string | null },
  deletedBy: string,
): Promise<void> {
  const now = new Date();

  await VillaModel.updateOne(
    { _id: villa._id },
    {
      $set: {
        isDeleted: true,
        deletedAt: now,
        deletedBy,
        status: "hidden",
        bookable: false,
      },
    },
  );

  await VillaBlockModel.updateMany(
    { villaId: villa._id, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: now, deletedBy } },
  );

  await VillaNightlockModel.deleteMany({ villaId: villa._id });
}
