import { describe, expect, it } from "vitest";
import { validateAndPreviewLead } from "@/lib/leads/buildLeadPreview";
import { LEAD_SOURCES } from "@/lib/leads/sourceLabels";

describe("validateAndPreviewLead", () => {
  for (const source of LEAD_SOURCES) {
    it(`accepts source ${source}`, () => {
      const isWedding = source === "wedding_enquiry";
      const isRathaa = source === "rathaa_enquiry";
      const result = validateAndPreviewLead({
        source,
        payload: isWedding
          ? {
              fullName: "Test Guest",
              email: "guest@example.com",
              phone: "9876543210",
            }
          : {
              fullName: "Test Guest",
              email: isRathaa ? "guest@example.com" : "",
              phoneNumber: isRathaa ? "" : "9876543210",
            },
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.preview).toContain(source);
      }
    });
  }

  it("rejects invalid source", () => {
    const result = validateAndPreviewLead({
      source: "weddings_enquiry",
      payload: { fullName: "X", phoneNumber: "9876543210" },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects party without contact", () => {
    const result = validateAndPreviewLead({
      source: "party_villas_enquiry",
      payload: { fullName: "X" },
    });
    expect(result.ok).toBe(false);
  });
});
