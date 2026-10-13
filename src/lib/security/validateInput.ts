import { z } from "zod";

/** Reject Mongo operator objects in user input. */
export function containsMongoOperators(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsMongoOperators);
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith("$")) return true;
    if (containsMongoOperators((value as Record<string, unknown>)[key])) return true;
  }
  return false;
}

export function assertPlainObject(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid body");
  }
  if (containsMongoOperators(body)) {
    throw new Error("Invalid payload");
  }
  return body as Record<string, unknown>;
}

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createBookingSchema = z.object({
  villaSlug: z.string().min(1).max(100),
  bookingType: z.enum(["stay", "day_out", "event"]).default("stay"),
  checkIn: isoDateSchema,
  checkOut: isoDateSchema,
  guests: z.number().int().min(1).max(500),
  adults: z.number().int().min(0).optional(),
  children: z.number().int().min(0).optional(),
  pets: z.number().int().min(0).optional(),
  fullName: z.string().min(1).max(200),
  phone: z.string().min(5).max(32),
  email: z.string().email().max(254),
  notes: z.string().max(2000).optional(),
  addOns: z
    .array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(100) }))
    .max(50)
    .optional(),
  eventTierId: z.string().optional(),
  eventGuests: z.number().int().min(1).optional(),
  eventStartDate: isoDateSchema.optional(),
  eventEndDate: isoDateSchema.optional(),
  paymentPlan: z.enum(["full", "deposit"]).default("full"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
