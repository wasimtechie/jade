/**
 * Shared lead/enquiry field validators (booking-quality rules).
 */

export function normalizeBookingPhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("91")) return d.slice(-10);
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  return d;
}

export function validateFullName(raw: string): string | undefined {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return "Please enter your full name.";
  if (name.length < 2) return "Name is too short.";
  if (name.length > 120) return "Name is too long.";
  if (/\d/.test(name)) return "Name cannot include numbers.";
  if (!/^[A-Za-z\u00C0-\u024F\s'.\-]+$/.test(name)) {
    return "Use letters only. Spaces, hyphens, apostrophes, and periods are ok.";
  }
  const letters = name.match(/[A-Za-z\u00C0-\u024F]/g);
  if (!letters || letters.length < 2) {
    return "Enter at least two letters in your name.";
  }
  return undefined;
}

export function validatePhone(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter your phone number.";
  const d = normalizeBookingPhoneDigits(trimmed);
  if (d.length < 10) return "Phone number is too short.";
  if (d.length > 15) return "Phone number is too long.";
  if (d.length === 10 && !/^[6-9]/.test(d)) {
    return "Enter a valid Indian mobile number (10 digits, starts with 6–9).";
  }
  return undefined;
}

export function validateEmail(raw: string): string | undefined {
  const e = raw.trim();
  if (!e) return "Please enter your email address.";
  if (e.length > 254) return "Email address is too long.";
  const simple =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!simple.test(e)) return "Enter a valid email address.";
  return undefined;
}

const NOTES_MAX_LENGTH = 2000;

export function validateNotesOptional(
  raw: string,
  maxLen = NOTES_MAX_LENGTH,
): string | undefined {
  if ((raw ?? "").length > maxLen) {
    return `Notes must be at most ${maxLen} characters.`;
  }
  return undefined;
}

export function validateGuestCount(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter the number of guests.";
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 1) {
    return "Enter a valid guest count (1 or more).";
  }
  return undefined;
}

export function validateRequiredSelect(
  value: string,
  label: string,
): string | undefined {
  if (!value.trim()) return `Please select ${label}.`;
  return undefined;
}

export function validateCheckInDate(checkIn: Date | null): string | undefined {
  if (!checkIn) return "Please choose your preferred date.";
  return undefined;
}

export type EnquiryFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  guests: string;
  occasionType: string;
  specialRequests?: string;
};

export type EnquiryFieldKey = keyof EnquiryFormValues | "preferredDate";

export type EnquiryFieldErrors = Partial<Record<EnquiryFieldKey, string>>;

export function enquiryFieldErrors(
  values: EnquiryFormValues,
  checkIn: Date | null,
): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};

  const ne = validateFullName(values.fullName);
  if (ne) errors.fullName = ne;

  const pe = validatePhone(values.phoneNumber);
  if (pe) errors.phoneNumber = pe;

  const ee = validateEmail(values.email);
  if (ee) errors.email = ee;

  const ge = validateGuestCount(values.guests);
  if (ge) errors.guests = ge;

  const de = validateCheckInDate(checkIn);
  if (de) errors.preferredDate = de;

  const oe = validateRequiredSelect(values.occasionType, "occasion type");
  if (oe) errors.occasionType = oe;

  const te = validateNotesOptional(values.specialRequests ?? "");
  if (te) errors.specialRequests = te;

  return errors;
}

export function isEnquiryFormValid(
  values: EnquiryFormValues,
  checkIn: Date | null,
): boolean {
  return Object.keys(enquiryFieldErrors(values, checkIn)).length === 0;
}

export type FooterFormValues = {
  fullName: string;
  phoneNumber: string;
  noOfGuests: string;
  occasionType: string;
  queries?: string;
};

export type FooterFieldKey = keyof FooterFormValues | "preferredDate" | "consent";

export type FooterFieldErrors = Partial<Record<FooterFieldKey, string>>;

export function footerFieldErrors(
  values: FooterFormValues,
  checkIn: Date | null,
  consent: boolean,
): FooterFieldErrors {
  const errors: FooterFieldErrors = {};

  const ne = validateFullName(values.fullName);
  if (ne) errors.fullName = ne;

  const pe = validatePhone(values.phoneNumber);
  if (pe) errors.phoneNumber = pe;

  const ge = validateGuestCount(values.noOfGuests);
  if (ge) errors.noOfGuests = ge;

  const de = validateCheckInDate(checkIn);
  if (de) errors.preferredDate = de;

  const oe = validateRequiredSelect(values.occasionType, "occasion type");
  if (oe) errors.occasionType = oe;

  const qe = validateNotesOptional(values.queries ?? "");
  if (qe) errors.queries = qe;

  if (!consent) {
    errors.consent = "Please accept the consent statement to continue.";
  }

  return errors;
}

export function isFooterFormValid(
  values: FooterFormValues,
  checkIn: Date | null,
  consent: boolean,
): boolean {
  return Object.keys(footerFieldErrors(values, checkIn, consent)).length === 0;
}

export type RathaaFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  guests: string;
  preferredDate: string;
  occasionType: string;
  specialRequests?: string;
  travelFormat: {
    oneDay: boolean;
    overnight: boolean;
    multiDay: boolean;
  };
};

export type RathaaFieldKey =
  | keyof RathaaFormValues
  | "travelFormat";

export type RathaaFieldErrors = Partial<Record<RathaaFieldKey, string>>;

export function rathaaFieldErrors(values: RathaaFormValues): RathaaFieldErrors {
  const errors: RathaaFieldErrors = {};

  const ne = validateFullName(values.fullName);
  if (ne) errors.fullName = ne;

  const pe = validatePhone(values.phoneNumber);
  if (pe) errors.phoneNumber = pe;

  const ee = validateEmail(values.email);
  if (ee) errors.email = ee;

  const ge = validateGuestCount(values.guests);
  if (ge) errors.guests = ge;

  if (!values.preferredDate.trim()) {
    errors.preferredDate = "Please enter your preferred date.";
  }

  const oe = validateRequiredSelect(values.occasionType, "occasion type");
  if (oe) errors.occasionType = oe;

  const hasFormat =
    values.travelFormat.oneDay ||
    values.travelFormat.overnight ||
    values.travelFormat.multiDay;
  if (!hasFormat) {
    errors.travelFormat = "Please select at least one travel format.";
  }

  const te = validateNotesOptional(values.specialRequests ?? "");
  if (te) errors.specialRequests = te;

  return errors;
}

export function isRathaaFormValid(values: RathaaFormValues): boolean {
  return Object.keys(rathaaFieldErrors(values)).length === 0;
}

export type CareersApplyFieldKey = "fullName" | "email" | "phone";

export type CareersApplyValues = {
  fullName: string;
  email: string;
  phone: string;
};

export type CareersApplyFieldErrors = Partial<
  Record<CareersApplyFieldKey, string>
>;

export function careersApplyFieldErrors(
  values: CareersApplyValues,
): CareersApplyFieldErrors {
  const errors: CareersApplyFieldErrors = {};
  const ne = validateFullName(values.fullName);
  if (ne) errors.fullName = ne;
  const ee = validateEmail(values.email);
  if (ee) errors.email = ee;
  const pe = validatePhone(values.phone);
  if (pe) errors.phone = pe;
  return errors;
}

export function isCareersApplyFormValid(
  values: CareersApplyValues,
  resumeError?: string | null,
  resumeFile?: File | null,
): boolean {
  if (!resumeFile || resumeFile.size === 0) return false;
  return (
    Object.keys(careersApplyFieldErrors(values)).length === 0 && !resumeError
  );
}

export function validateRequiredText(
  raw: string,
  label: string,
): string | undefined {
  if (!raw.trim()) return `Please enter ${label}.`;
  return undefined;
}

export type PartnerFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  company: string;
  partnershipType: {
    propertyOwner: boolean;
    weddingPlanner: boolean;
    corporatePartner: boolean;
    musicEntertainment: boolean;
  };
  partnershipOther: string;
  propertyType: {
    privateVilla: boolean;
    farmhouse: boolean;
    villaInGated: boolean;
    retreatSpace: boolean;
  };
  propertyOther: string;
  propertyDetails: {
    location: string;
    bedrooms: string;
    eventCapacity: string;
  };
};

export type PartnerFieldKey =
  | "fullName"
  | "phoneNumber"
  | "email"
  | "partnershipType"
  | "propertyType"
  | "propertyLocation"
  | "propertyBedrooms"
  | "propertyEventCapacity"
  | "photos";

export type PartnerFieldErrors = Partial<Record<PartnerFieldKey, string>>;

function hasAnyCheckbox(
  pairs: Record<string, boolean> | undefined,
): boolean {
  return !!pairs && Object.values(pairs).some(Boolean);
}

export function partnerFieldErrors(
  values: PartnerFormValues,
  photoCount: number,
): PartnerFieldErrors {
  const errors: PartnerFieldErrors = {};

  const ne = validateFullName(values.fullName);
  if (ne) errors.fullName = ne;

  const pe = validatePhone(values.phoneNumber);
  if (pe) errors.phoneNumber = pe;

  const ee = validateEmail(values.email);
  if (ee) errors.email = ee;

  const hasPartnership =
    hasAnyCheckbox(values.partnershipType) ||
    values.partnershipOther.trim().length > 0;
  if (!hasPartnership) {
    errors.partnershipType =
      "Please select at least one partnership interest.";
  }

  const hasProperty =
    hasAnyCheckbox(values.propertyType) ||
    values.propertyOther.trim().length > 0;
  if (!hasProperty) {
    errors.propertyType = "Please select at least one property type.";
  }

  const loc = validateRequiredText(
    values.propertyDetails.location,
    "location",
  );
  if (loc) errors.propertyLocation = loc;

  const bed = validateRequiredText(
    values.propertyDetails.bedrooms,
    "number of bedrooms",
  );
  if (bed) errors.propertyBedrooms = bed;

  const cap = validateRequiredText(
    values.propertyDetails.eventCapacity,
    "outdoor event capacity",
  );
  if (cap) errors.propertyEventCapacity = cap;

  if (photoCount < 1) {
    errors.photos = "Please upload at least one property image.";
  }

  return errors;
}

export function isPartnerFormValid(
  values: PartnerFormValues,
  photoCount: number,
): boolean {
  return Object.keys(partnerFieldErrors(values, photoCount)).length === 0;
}
