import { afterEach, describe, expect, it } from "vitest";
import {
  STAFF_NOTIFY_INBOX,
  firstStaffRecipient,
  getStaffNotifyRecipients,
} from "@/lib/email/staffRecipients";

const envBackup = { ...process.env };

afterEach(() => {
  process.env = { ...envBackup };
});

describe("getStaffNotifyRecipients", () => {
  it("uses STAFF_NOTIFY_EMAIL when set", () => {
    process.env.STAFF_NOTIFY_EMAIL = "Enquiry@jaderetreats.com";
    expect(getStaffNotifyRecipients()).toEqual(["enquiry@jaderetreats.com"]);
  });

  it("defaults to Enquiry@jaderetreats.com when unset", () => {
    delete process.env.STAFF_NOTIFY_EMAIL;
    delete process.env.BOOKING_NOTIFY_EMAIL;
    delete process.env.LEADS_NOTIFY_EMAIL;
    expect(getStaffNotifyRecipients()).toEqual(["enquiry@jaderetreats.com"]);
  });

  it("ignores legacy split notify env vars", () => {
    delete process.env.STAFF_NOTIFY_EMAIL;
    process.env.BOOKING_NOTIFY_EMAIL = "ops@jaderetreats.com";
    process.env.LEADS_NOTIFY_EMAIL = "concierge@jaderetreats.com";
    expect(getStaffNotifyRecipients()).toEqual(["enquiry@jaderetreats.com"]);
  });
});

describe("firstStaffRecipient", () => {
  it("returns Enquiry inbox", () => {
    delete process.env.STAFF_NOTIFY_EMAIL;
    expect(firstStaffRecipient()).toBe("enquiry@jaderetreats.com");
  });

  it("exports locked inbox constant", () => {
    expect(STAFF_NOTIFY_INBOX).toBe("Enquiry@jaderetreats.com");
  });
});
