import { describe, expect, it } from "vitest";
import {
  validateLogin,
  validateUserForm,
  validatePasswordReset,
} from "./dashboardFormValidation";
import { validateManualBooking, validateManualBlock } from "./formValidation";

describe("validateManualBooking", () => {
  const base = {
    villaSlug: "magnolia",
    checkIn: "2026-06-24",
    checkOut: "2026-06-27",
    fullName: "Tharun Kumar",
    email: "tharun@gmail.com",
    phone: "9876543210",
    guests: 4,
    maxGuests: 40,
  };

  it("accepts valid input", () => {
    expect(validateManualBooking(base)).toEqual({});
  });

  it("rejects guests above villa max", () => {
    const errors = validateManualBooking({ ...base, guests: 200 });
    expect(errors.guests).toMatch(/Maximum 40/);
  });

  it("rejects invalid date range", () => {
    const errors = validateManualBooking({
      ...base,
      checkOut: "2026-06-24",
    });
    expect(errors.checkOut).toBeDefined();
  });

  it("rejects short phone", () => {
    expect(validateManualBooking({ ...base, phone: "123" }).phone).toBeDefined();
  });
});

describe("validateManualBlock", () => {
  it("rejects overlapping dates", () => {
    const errors = validateManualBlock({
      villaSlug: "magnolia",
      checkIn: "2026-06-27",
      checkOut: "2026-06-24",
      reason: "Owner hold",
    });
    expect(errors.checkOut).toBeDefined();
  });
});

describe("validateLogin", () => {
  it("requires email and password", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe("validateUserForm", () => {
  it("requires matching passwords on create", () => {
    const errors = validateUserForm({
      email: "a@b.com",
      password: "password1",
      confirmPassword: "password2",
      isCreate: true,
    });
    expect(errors.confirmPassword).toBeDefined();
  });
});

describe("validatePasswordReset", () => {
  it("rejects mismatched passwords", () => {
    const errors = validatePasswordReset({
      password: "password1",
      confirmPassword: "password2",
    });
    expect(errors.confirmPassword).toBeDefined();
  });
});
