export const BOOKING_HOLD_MINUTES = Number(
  process.env.BOOKING_HOLD_MINUTES ?? 15,
);

export const DEFAULT_CHILD_FREE_AGE_LIMIT = Number(
  process.env.CHILD_FREE_AGE_LIMIT ?? 5,
);

export const DEFAULT_DEPOSIT_PERCENT = Number(
  process.env.DEFAULT_DEPOSIT_PERCENT ?? 0,
);

export const GSTIN = process.env.JADE_GSTIN ?? "[TO BE CONFIRMED]";
