import { z } from "zod";
import {
  createVillaSchema,
  updateVillaSchema,
  type AdminVillaDetail,
} from "./adminVilla";
import {
  mapZodFlattenToFieldErrors,
  type FieldErrors,
} from "@/lib/dashboard/dashboardFormValidation";
import { WIZARD_FINAL_STEP } from "./villaEditorLabels";

export type WizardDraft = Record<string, unknown>;

function zodErrors(schema: z.ZodType, data: unknown): FieldErrors {
  const result = schema.safeParse(data);
  if (result.success) return {};
  return mapZodFlattenToFieldErrors(result.error);
}

export function validateQuickEdit(villa: AdminVillaDetail): FieldErrors {
  return zodErrors(updateVillaSchema, {
    name: villa.name,
    shortName: villa.shortName,
    type: villa.type,
    location: villa.location,
    thumbnail: villa.thumbnail,
    basePriceRupees: villa.basePriceRupees,
    dayOutBasePriceRupees: villa.dayOutBasePriceRupees,
    stayBasePax: villa.stayBasePax,
    dayOutBasePax: villa.dayOutBasePax,
    stayMaxPax: villa.stayMaxPax,
    extraPaxStayRupees: villa.extraPaxStayRupees,
    extraPaxDayOutRupees: villa.extraPaxDayOutRupees,
    taxPercent: villa.taxPercent,
    cleaningFeeRupees: villa.cleaningFeeRupees,
    securityDepositRupees: villa.securityDepositRupees,
    depositPaiseRupees: villa.depositPaiseRupees,
    checkInTime: villa.checkInTime,
    checkOutTime: villa.checkOutTime,
    cancellationPolicy: villa.cancellationPolicy,
    depositPercent: villa.depositPercent,
    status: villa.status,
    bookable: villa.bookable,
    weddingVenue: villa.weddingVenue,
    weddingTiers: villa.weddingTiers,
    addOnAvailability: villa.addOnAvailability,
    displayStats: villa.displayStats,
    notes: villa.notes,
    axisRooms: villa.axisRooms,
    content: villa.content,
  });
}

export function validateCreateVilla(draft: WizardDraft): FieldErrors {
  return zodErrors(createVillaSchema, draft);
}

export function validateUpdateVilla(draft: WizardDraft): FieldErrors {
  return zodErrors(updateVillaSchema, draft);
}

/** Per-step validation for PropertyWizard (0–12). */
export function validateWizardStep(step: number, draft: WizardDraft): FieldErrors {
  switch (step) {
    case 0: {
      const errors: FieldErrors = {};
      const slug = String(draft.slug ?? "").trim();
      const name = String(draft.name ?? "").trim();
      const shortName = String(draft.shortName ?? "").trim();
      if (!slug) errors.slug = "URL slug is required";
      if (name.length < 2) errors.name = "Villa name must be at least 2 characters";
      if (shortName.length < 1) errors.shortName = "Short name is required";
      return errors;
    }
    case 2: {
      const errors: FieldErrors = {};
      const location = String(draft.location ?? "").trim();
      if (location.length > 200) errors.location = "Location is too long";
      return errors;
    }
    case 6: {
      const errors: FieldErrors = {};
      const url = String(
        (draft.content as { video?: { youtubeUrl?: string } })?.video?.youtubeUrl ?? "",
      ).trim();
      if (url && !/^https?:\/\//i.test(url)) {
        errors["content.video.youtubeUrl"] = "Enter a valid URL starting with http(s)://";
      }
      return errors;
    }
    case WIZARD_FINAL_STEP:
      return validateCreateVilla(draft);
    default:
      return {};
  }
}

export function wizardStepHasError(
  step: number,
  draft: WizardDraft,
  submitAttempted: boolean,
): boolean {
  if (!submitAttempted && step > 0) return false;
  return Object.keys(validateWizardStep(step, draft)).length > 0;
}
