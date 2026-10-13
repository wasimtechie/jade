import { connectDB, mongoose } from "@/lib/db";
import type { ClientSession, Types } from "mongoose";

function isTxnUnsupportedError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /replica set|Transaction numbers|transactions are not supported|transaction.*not.*supported/i.test(
    msg,
  );
}

export async function acquireNightLocks(params: {
  villaId: Types.ObjectId;
  bookingId: Types.ObjectId;
  dates: string[];
  session?: ClientSession | null;
}): Promise<{ ok: true } | { ok: false; conflictDate: string }> {
  const { VillaNightlockModel } = await import("@/models/VillaNightlock");

  for (const date of params.dates) {
    try {
      await VillaNightlockModel.create(
        [
          {
            villaId: params.villaId,
            date,
            bookingId: params.bookingId,
          },
        ],
        params.session != null ? { session: params.session } : undefined,
      );
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err.code === 11000) {
        return { ok: false, conflictDate: date };
      }
      throw e;
    }
  }
  return { ok: true };
}

export async function releaseNightLocks(
  bookingId: Types.ObjectId,
  session?: ClientSession | null,
): Promise<void> {
  const { VillaNightlockModel } = await import("@/models/VillaNightlock");
  await VillaNightlockModel.deleteMany(
    { bookingId },
    session != null ? { session } : undefined,
  );
}

/**
 * Run work in a Mongo transaction when supported (replica set).
 * Standalone Mongo (typical VPS) falls back to no session so API 9 can still save.
 */
export async function withTransaction<T>(
  fn: (session: ClientSession | null) => Promise<T>,
): Promise<T> {
  await connectDB();
  const session = await mongoose.startSession();

  let useTxn = true;
  try {
    session.startTransaction();
  } catch (e) {
    if (isTxnUnsupportedError(e)) {
      useTxn = false;
    } else {
      session.endSession();
      throw e;
    }
  }

  if (!useTxn) {
    try {
      // null is valid for Query.session(); undefined is not
      return await fn(null);
    } finally {
      session.endSession();
    }
  }

  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (e) {
    try {
      await session.abortTransaction();
    } catch {
      /* ignore abort errors */
    }
    // Race: startTransaction accepted but later op rejects standalone
    if (isTxnUnsupportedError(e)) {
      return fn(null);
    }
    throw e;
  } finally {
    session.endSession();
  }
}
