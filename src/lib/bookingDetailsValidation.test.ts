import { describe, expect, it } from "vitest";
import { bookingDetailsFieldErrors } from "@/lib/bookingDetailsValidation";

describe("bookingDetailsFieldErrors", () => {
  it("returns no errors for valid Indian contact details", () => {
    expect(
      bookingDetailsFieldErrors({
        fullName: "Asha Verma",
        phone: "9876543210",
        email: "guest@example.com",
        notes: "",
      }),
    ).toEqual({});
  });

  it("flags invalid mobile prefix for 10-digit Indian numbers", () => {
    const errs = bookingDetailsFieldErrors({
      fullName: "Asha Verma",
      phone: "5876543210",
      email: "guest@example.com",
      notes: "",
    });
    expect(errs.phone).toBeDefined();
  });
});
