import { describe, expect, it } from "vitest";
import {
  enquiryFieldErrors,
  footerFieldErrors,
  isEnquiryFormValid,
  isPartnerFormValid,
  partnerFieldErrors,
  validateGuestCount,
} from "@/lib/leadFormValidation";

const emptyPartnerForm = {
  fullName: "",
  phoneNumber: "",
  email: "",
  company: "",
  partnershipType: {
    propertyOwner: false,
    weddingPlanner: false,
    corporatePartner: false,
    musicEntertainment: false,
  },
  partnershipOther: "",
  propertyType: {
    privateVilla: false,
    farmhouse: false,
    villaInGated: false,
    retreatSpace: false,
  },
  propertyOther: "",
  propertyDetails: {
    location: "",
    bedrooms: "",
    eventCapacity: "",
  },
} as const;

describe("leadFormValidation", () => {
  it("enquiryFieldErrors flags empty email", () => {
    const errs = enquiryFieldErrors(
      {
        fullName: "Asha Verma",
        phoneNumber: "9876543210",
        email: "",
        guests: "4",
        occasionType: "Wedding",
      },
      new Date(2026, 5, 1),
    );
    expect(errs.email).toBe("Please enter your email address.");
  });

  it("footerFieldErrors requires check-in date", () => {
    const errs = footerFieldErrors(
      {
        fullName: "Asha Verma",
        phoneNumber: "9876543210",
        noOfGuests: "4",
        occasionType: "Wedding",
      },
      null,
      true,
    );
    expect(errs.preferredDate).toBeDefined();
  });

  it("isEnquiryFormValid is false without date", () => {
    expect(
      isEnquiryFormValid(
        {
          fullName: "Asha Verma",
          phoneNumber: "9876543210",
          email: "a@b.com",
          guests: "2",
          occasionType: "Wedding",
        },
        null,
      ),
    ).toBe(false);
  });

  it("validateGuestCount rejects zero", () => {
    expect(validateGuestCount("0")).toBeDefined();
  });

  it("partnerFieldErrors requires property details and photos", () => {
    const errs = partnerFieldErrors(
      {
        ...emptyPartnerForm,
        fullName: "Saad Ali",
        phoneNumber: "9876543210",
        email: "a@b.com",
        partnershipType: {
          ...emptyPartnerForm.partnershipType,
          propertyOwner: true,
        },
        propertyType: {
          ...emptyPartnerForm.propertyType,
          privateVilla: true,
        },
      },
      0,
    );
    expect(errs.propertyLocation).toBeDefined();
    expect(errs.propertyBedrooms).toBeDefined();
    expect(errs.propertyEventCapacity).toBeDefined();
    expect(errs.photos).toBeDefined();
  });

  it("isPartnerFormValid when all required fields present", () => {
    expect(
      isPartnerFormValid(
        {
          ...emptyPartnerForm,
          fullName: "Saad Ali",
          phoneNumber: "9876543210",
          email: "a@b.com",
          partnershipType: {
            ...emptyPartnerForm.partnershipType,
            propertyOwner: true,
          },
          propertyType: {
            ...emptyPartnerForm.propertyType,
            privateVilla: true,
          },
          propertyDetails: {
            location: "Goa",
            bedrooms: "4",
            eventCapacity: "100",
          },
        },
        1,
      ),
    ).toBe(true);
  });
});
