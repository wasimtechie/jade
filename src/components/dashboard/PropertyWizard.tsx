"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import {
  GLASS_CHROME_FRAME_CLASS,
  GLASS_INNER_SURFACE,
} from "@/lib/glassChrome";
import { dash } from "@/lib/dashboard/dashboardClasses";
import type { FieldErrors } from "@/lib/dashboard/dashboardFormValidation";
import { dashboardFetch } from "@/lib/dashboard/dashboardFetch";
import type { AdminVillaDetail, AdminWeddingTier } from "@/lib/villas/adminVilla";
import { validateQuickEdit } from "@/lib/villas/villaEditorValidation";
import { VillaOperationalFields } from "./villa/VillaOperationalFields";
import { VillaDeletePanel } from "./villa/VillaDeletePanel";
import {
  formatZodValidationError,
  normalizeVillaSlug,
} from "@/lib/villas/villaIds";
import { WIZARD_STEPS, WIZARD_FINAL_STEP, FIELD_LABELS, DISPLAY_STAT_FIELD_LABELS } from "@/lib/villas/villaEditorLabels";
import {
  validateWizardStep,
  validateCreateVilla,
} from "@/lib/villas/villaEditorValidation";
import {
  DashWizardStepper,
  DashFormShell,
  DashFormActionBar,
  DashSectionCard,
  DashFloatingField,
  DashFloatingTextarea,
  DashFormNotice,
  type WizardStepState,
} from "@/components/dashboard/form";
import { ImageUploadField } from "./ImageUploadField";
import { AmenityEditorRows } from "./wizard/AmenityEditorRows";
import { BrochureUploadField } from "./wizard/BrochureUploadField";
import {
  NearbyLandmarkRows,
  nearbyDraftFromStored,
  nearbyDraftToPayload,
  type NearbyDraft,
} from "./wizard/NearbyLandmarkRows";
import {
  wizardHintClass,
  wizardInputClass,
  wizardLabelClass,
  wizardSectionClass,
} from "./wizard/wizardFieldStyles";
import { VillaIconPicker } from "./villa/VillaIconPicker";
import {
  VillaFormGrid,
  VillaFormSection,
  VillaFormSelect,
  VillaFormToggle,
} from "./villa/VillaFormPrimitives";

const inputClass = wizardInputClass;
const labelClass = wizardLabelClass;
const hintClass = wizardHintClass;

type AmenityRow = { label: string; icon: string; description: string };
type ActivityRow = { title: string; image: string; description: string };
type SpaceRow = {
  id: string;
  title: string;
  category: string;
  amenities: string;
  images: string;
};
type FaqRow = { question: string; answer: string };
type PerfectForCardRow = { title: string; image: string };
type ServiceRow = {
  title: string;
  description: string;
  footer: string;
  icon: string;
};
type PropertyDetailRow = { title: string; description: string; icon: string };

type ContentDraft = {
  description: string;
  socialProof: string;
  categories: string;
  perfectForTags: string;
  perfectForCards: PerfectForCardRow[];
  amenities: AmenityRow[];
  activities: ActivityRow[];
  categorizedSpaces: SpaceRow[];
  images: string;
  youtubeUrl: string;
  videoThumbnail: string;
  videoDuration: string;
  address: string;
  distance: string;
  googleMapsUrl: string;
  mapImage: string;
  nearbyRows: NearbyDraft[];
  brochureUrl: string;
  brochureFilename: string;
  services: ServiceRow[];
  propertyDetails: PropertyDetailRow[];
  faq: FaqRow[];
  hideFromVillasDirectory: boolean;
};

type BasicsDraft = {
  slug: string;
  retreatId: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  thumbnail: string;
  status: string;
  bookable: boolean;
};

type OperationalDraft = {
  basePriceRupees: number;
  dayOutBasePriceRupees: number;
  stayBasePax: number;
  dayOutBasePax: number;
  stayMaxPax: number;
  extraPaxStayRupees: number;
  extraPaxDayOutRupees: number;
  taxPercent: number;
  cleaningFeeRupees: number;
  securityDepositRupees: number;
  depositPaiseRupees: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  depositPercent: number;
  weddingVenue: boolean;
  weddingTiers: AdminWeddingTier[];
  addOnAvailability: string[];
  displayStats: Record<string, string>;
};

type ChannelMetaDraft = Pick<
  AdminVillaDetail,
  "channelMode" | "channelState" | "axisRooms"
>;

function emptyChannelMeta(): ChannelMetaDraft {
  return {
    channelMode: "website_only",
    channelState: "website_only",
    axisRooms: { propertyId: "", roomTypeId: "", ratePlanId: "", ratePlanName: "" },
  };
}

function channelMetaFromAdmin(v: AdminVillaDetail): ChannelMetaDraft {
  return {
    channelMode: v.channelMode,
    channelState: v.channelState,
    axisRooms: v.axisRooms,
  };
}

function emptyOperational(): OperationalDraft {
  return {
    basePriceRupees: 0,
    dayOutBasePriceRupees: 0,
    stayBasePax: 4,
    dayOutBasePax: 8,
    stayMaxPax: 8,
    extraPaxStayRupees: 2000,
    extraPaxDayOutRupees: 1000,
    taxPercent: 18,
    cleaningFeeRupees: 0,
    securityDepositRupees: 0,
    depositPaiseRupees: 0,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationPolicy: "",
    depositPercent: 0,
    weddingVenue: false,
    weddingTiers: [],
    addOnAvailability: [],
    displayStats: {},
  };
}

function operationalFromAdmin(v: AdminVillaDetail): OperationalDraft {
  return {
    basePriceRupees: v.basePriceRupees,
    dayOutBasePriceRupees: v.dayOutBasePriceRupees,
    stayBasePax: v.stayBasePax,
    dayOutBasePax: v.dayOutBasePax,
    stayMaxPax: v.stayMaxPax,
    extraPaxStayRupees: v.extraPaxStayRupees,
    extraPaxDayOutRupees: v.extraPaxDayOutRupees,
    taxPercent: v.taxPercent,
    cleaningFeeRupees: v.cleaningFeeRupees,
    securityDepositRupees: v.securityDepositRupees,
    depositPaiseRupees: v.depositPaiseRupees,
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
    cancellationPolicy: v.cancellationPolicy,
    depositPercent: v.depositPercent,
    weddingVenue: v.weddingVenue,
    weddingTiers: v.weddingTiers,
    addOnAvailability: v.addOnAvailability,
    displayStats: { ...v.displayStats },
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function linesToList(s: string) {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function listToLines(arr: string[] | undefined) {
  return (arr ?? []).join("\n");
}

function emptyContent(): ContentDraft {
  return {
    description: "",
    socialProof: "",
    categories: "",
    perfectForTags: "",
    perfectForCards: [{ title: "", image: "" }],
    amenities: [{ label: "", icon: "Sparkles", description: "" }],
    activities: [{ title: "", image: "", description: "" }],
    categorizedSpaces: [
      { id: "space-1", title: "", category: "Indoor", amenities: "", images: "" },
    ],
    images: "",
    youtubeUrl: "",
    videoThumbnail: "",
    videoDuration: "",
    address: "",
    distance: "",
    googleMapsUrl: "",
    mapImage: "",
    nearbyRows: [{ label: "", distance: "", note: "" }],
    brochureUrl: "",
    brochureFilename: "",
    services: [{ title: "", description: "", footer: "", icon: "Sparkles" }],
    propertyDetails: [{ title: "", description: "", icon: "Home" }],
    faq: [{ question: "", answer: "" }],
    hideFromVillasDirectory: false,
  };
}

function contentFromAdmin(
  content: Record<string, unknown>,
): ContentDraft {
  const c = content as {
    description?: string;
    socialProof?: string;
    categories?: string[];
    perfectForTags?: string[];
    perfectForCards?: PerfectForCardRow[];
    amenities?: AmenityRow[];
    activities?: ActivityRow[];
    categorizedSpaces?: {
      id: string;
      title: string;
      category: string;
      amenities: string[];
      images: string[];
    }[];
    images?: string[];
    locationDetails?: {
      mapImage?: string;
      address?: string;
      distance?: string;
      googleMapsUrl?: string;
      nearby?: { label: string; distance: string; note?: string }[];
    };
    services?: Array<ServiceRow & { footer?: string }>;
    propertyDetails?: PropertyDetailRow[];
    video?: { youtubeUrl?: string; thumbnail?: string; duration?: string };
    faq?: FaqRow[];
    hideFromVillasDirectory?: boolean;
    brochureUrl?: string;
    brochureFilename?: string;
  };

  return {
    description: c.description ?? "",
    socialProof: c.socialProof ?? "",
    categories: listToLines(c.categories),
    perfectForTags: listToLines(c.perfectForTags),
    perfectForCards:
      c.perfectForCards && c.perfectForCards.length > 0
        ? c.perfectForCards.map((card) => ({
            title: card.title ?? "",
            image: card.image ?? "",
          }))
        : [{ title: "", image: "" }],
    amenities:
      c.amenities && c.amenities.length > 0
        ? c.amenities.map((a) => ({
            label: a.label ?? "",
            icon: a.icon ?? "Sparkles",
            description: a.description ?? "",
          }))
        : [{ label: "", icon: "Sparkles", description: "" }],
    activities:
      c.activities && c.activities.length > 0
        ? c.activities.map((a) => ({
            title: a.title ?? "",
            image: a.image ?? "",
            description: a.description ?? "",
          }))
        : [{ title: "", image: "", description: "" }],
    categorizedSpaces:
      c.categorizedSpaces && c.categorizedSpaces.length > 0
        ? c.categorizedSpaces.map((s) => ({
            id: s.id,
            title: s.title ?? "",
            category: s.category ?? "",
            amenities: (s.amenities ?? []).join(", "),
            images: (s.images ?? []).join("\n"),
          }))
        : [
            {
              id: "space-1",
              title: "",
              category: "Indoor",
              amenities: "",
              images: "",
            },
          ],
    images: listToLines(c.images),
    youtubeUrl: c.video?.youtubeUrl ?? "",
    videoThumbnail: c.video?.thumbnail ?? "",
    videoDuration: c.video?.duration ?? "",
    address: c.locationDetails?.address ?? "",
    distance: c.locationDetails?.distance ?? "",
    googleMapsUrl: c.locationDetails?.googleMapsUrl ?? "",
    mapImage: c.locationDetails?.mapImage ?? "",
    nearbyRows: nearbyDraftFromStored(c.locationDetails?.nearby),
    brochureUrl: c.brochureUrl ?? "",
    brochureFilename: c.brochureFilename ?? "",
    services:
      c.services && c.services.length > 0
        ? c.services.map((s) => ({
            title: s.title ?? "",
            description: s.description ?? "",
            footer: s.footer ?? "",
            icon: s.icon ?? "Sparkles",
          }))
        : [{ title: "", description: "", footer: "", icon: "Sparkles" }],
    propertyDetails:
      c.propertyDetails && c.propertyDetails.length > 0
        ? c.propertyDetails.map((p) => {
            const row = p as PropertyDetailRow & { label?: string };
            return {
              title: row.title ?? row.label ?? "",
              description: row.description ?? "",
              icon: row.icon ?? "Home",
            };
          })
        : [{ title: "", description: "", icon: "Home" }],
    faq:
      c.faq && c.faq.length > 0
        ? c.faq
        : [{ question: "", answer: "" }],
    hideFromVillasDirectory: c.hideFromVillasDirectory ?? false,
  };
}

function buildContentPayload(draft: ContentDraft) {
  return {
    description: draft.description.trim(),
    socialProof: draft.socialProof.trim() || undefined,
    categories: linesToList(draft.categories),
    perfectForTags: linesToList(draft.perfectForTags),
    perfectForCards: draft.perfectForCards
      .filter((c) => c.title.trim())
      .map((c) => ({
        title: c.title.trim(),
        image: c.image.trim(),
      })),
    amenities: draft.amenities
      .filter((a) => a.label.trim())
      .map((a) => ({
        label: a.label.trim(),
        icon: a.icon.trim() || "Sparkles",
        description: a.description.trim() || undefined,
      })),
    activities: draft.activities
      .filter((a) => a.title.trim())
      .map((a) => ({
        title: a.title.trim(),
        image: a.image.trim(),
        description: a.description.trim() || undefined,
      })),
    categorizedSpaces: draft.categorizedSpaces
      .filter((s) => s.title.trim())
      .map((s) => ({
        id: s.id || slugify(s.title) || `space-${Date.now()}`,
        title: s.title.trim(),
        category: s.category.trim() || "Indoor",
        amenities: s.amenities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        images: linesToList(s.images),
      })),
    images: linesToList(draft.images),
    locationDetails: {
      mapImage: draft.mapImage.trim() || undefined,
      address: draft.address.trim() || undefined,
      distance: draft.distance.trim() || undefined,
      googleMapsUrl: draft.googleMapsUrl.trim() || undefined,
      nearby: nearbyDraftToPayload(draft.nearbyRows),
    },
    services: draft.services
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        description: s.description.trim() || undefined,
        footer: s.footer.trim() || undefined,
        icon: s.icon.trim() || undefined,
      })),
    propertyDetails: draft.propertyDetails
      .filter((p) => p.title.trim() && p.description.trim())
      .map((p) => ({
        title: p.title.trim(),
        description: p.description.trim(),
        icon: p.icon.trim() || undefined,
      })),
    video: (() => {
      const youtubeUrl = draft.youtubeUrl.trim();
      const thumbnail = draft.videoThumbnail.trim();
      const duration = draft.videoDuration.trim();
      if (!youtubeUrl && !thumbnail && !duration) return undefined;
      return {
        ...(youtubeUrl ? { youtubeUrl } : {}),
        ...(thumbnail ? { thumbnail } : {}),
        ...(duration ? { duration } : {}),
      };
    })(),
    faq: draft.faq
      .filter((f) => f.question.trim())
      .map((f) => ({
        question: f.question.trim(),
        answer: f.answer.trim(),
      })),
    hideFromVillasDirectory: draft.hideFromVillasDirectory,
    ...(draft.hideFromVillasDirectory
      ? { directoryListingOptOut: true }
      : { directoryListingOptOut: false }),
    brochureUrl: draft.brochureUrl.trim() || undefined,
    brochureFilename: draft.brochureFilename.trim() || undefined,
  };
}

function buildWizardDraft(
  basics: BasicsDraft,
  content: ContentDraft,
  operational: OperationalDraft,
) {
  return {
    slug: basics.slug,
    retreatId: basics.retreatId.trim() || basics.slug,
    name: basics.name,
    shortName: basics.shortName,
    type: basics.type,
    location: basics.location,
    thumbnail: basics.thumbnail,
    status: basics.status,
    bookable: basics.bookable,
    content: buildContentPayload(content),
    basePriceRupees: operational.basePriceRupees,
    dayOutBasePriceRupees: operational.dayOutBasePriceRupees,
    stayBasePax: operational.stayBasePax,
    dayOutBasePax: operational.dayOutBasePax,
    stayMaxPax: operational.stayMaxPax,
    extraPaxStayRupees: operational.extraPaxStayRupees,
    extraPaxDayOutRupees: operational.extraPaxDayOutRupees,
    taxPercent: operational.taxPercent,
    cleaningFeeRupees: operational.cleaningFeeRupees,
    securityDepositRupees: operational.securityDepositRupees,
    depositPaiseRupees: operational.depositPaiseRupees,
    checkInTime: operational.checkInTime,
    checkOutTime: operational.checkOutTime,
    cancellationPolicy: operational.cancellationPolicy,
    depositPercent: operational.depositPercent,
    weddingVenue: operational.weddingVenue,
    weddingTiers: operational.weddingTiers,
    addOnAvailability: operational.addOnAvailability,
    displayStats: operational.displayStats,
  };
}

function scrollToFirstFieldError(errors: FieldErrors) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const el =
    document.getElementById(firstKey) ??
    document.querySelector(`[data-field="${firstKey}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function wizardStepState(
  index: number,
  currentStep: number,
  draft: ReturnType<typeof buildWizardDraft>,
  attemptedSteps: Set<number>,
): WizardStepState {
  if (index === currentStep) return "active";
  if (
    attemptedSteps.has(index) &&
    Object.keys(validateWizardStep(index, draft)).length > 0
  ) {
    return "error";
  }
  if (index < currentStep) return "done";
  return "pending";
}

type PropertyWizardProps = {
  mode: "create" | "edit";
  slug?: string;
  canWrite: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function PropertyWizard({
  mode,
  slug: editSlug,
  canWrite,
  onClose,
  onSaved,
}: PropertyWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(
    () => new Set(),
  );
  const [basics, setBasics] = useState<BasicsDraft>({
    slug: "",
    retreatId: "",
    name: "",
    shortName: "",
    type: "",
    location: "",
    thumbnail: "",
    status: "hidden",
    bookable: false,
  });
  const [content, setContent] = useState<ContentDraft>(emptyContent());
  const [operational, setOperational] = useState<OperationalDraft>(emptyOperational());
  const [channelMeta, setChannelMeta] = useState<ChannelMetaDraft>(emptyChannelMeta());
  const [deletion, setDeletion] = useState<{
    allowed: boolean;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !editSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await dashboardFetch(`/api/dashboard/villas/${editSlug}`);
        if (!res.ok) throw new Error("Failed to load villa");
        const data = (await res.json()) as {
          villa: AdminVillaDetail;
          deletion?: { allowed: boolean; reason?: string };
        };
        if (cancelled) return;
        const v = data.villa;
        setDeletion(data.deletion ?? { allowed: false });
        setBasics({
          slug: v.slug,
          retreatId: v.retreatId ?? "",
          name: v.name,
          shortName: v.shortName,
          type: v.type ?? "",
          location: v.location ?? "",
          thumbnail: v.thumbnail ?? "",
          status: v.status,
          bookable: v.bookable,
        });
        setContent(contentFromAdmin(v.content));
        setOperational(operationalFromAdmin(v));
        setChannelMeta(channelMetaFromAdmin(v));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, editSlug]);

  const previewId = basics.retreatId || basics.slug;
  const slugForUpload = basics.slug || "new-property";

  const wizardDraft = useMemo(
    () => buildWizardDraft(basics, content, operational),
    [basics, content, operational],
  );

  const stepperItems = useMemo(
    () =>
      WIZARD_STEPS.map((s, i) => ({
        id: s.id,
        label: s.label,
        shortLabel: s.shortLabel,
        state: wizardStepState(i, step, wizardDraft, attemptedSteps),
      })),
    [step, wizardDraft, attemptedSteps],
  );

  const showFieldError = useCallback(
    (key: string) => attemptedSteps.has(step) || Boolean(touched[key]),
    [attemptedSteps, step, touched],
  );

  const fieldProps = useCallback(
    (key: string) => ({
      invalid: Boolean(fieldErrors[key]),
      showError: showFieldError(key) && Boolean(fieldErrors[key]),
      errorMessage: fieldErrors[key],
      onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    }),
    [fieldErrors, showFieldError],
  );

  const operationalFieldProps = useCallback(
    (key: string) => ({
      id: key,
      invalid: Boolean(fieldErrors[key]),
      showError: showFieldError(key) && Boolean(fieldErrors[key]),
      errorMessage: fieldErrors[key],
      onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    }),
    [fieldErrors, showFieldError],
  );

  const runStepValidation = useCallback(
    (stepIndex: number) => {
      const errors = validateWizardStep(stepIndex, wizardDraft);
      setAttemptedSteps((prev) => new Set(prev).add(stepIndex));
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) {
        scrollToFirstFieldError(errors);
        return false;
      }
      return true;
    },
    [wizardDraft],
  );

  const handleNext = () => {
    if (!runStepValidation(step)) return;
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const handleStepClick = (index: number) => {
    if (index > step && !runStepValidation(step)) return;
    setStep(index);
  };

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canWrite) return;

    const finalErrors =
      mode === "create"
        ? validateCreateVilla(wizardDraft)
        : validateWizardStep(WIZARD_FINAL_STEP, wizardDraft);
    setAttemptedSteps((prev) => new Set(prev).add(WIZARD_FINAL_STEP));
    if (Object.keys(finalErrors).length > 0) {
      setFieldErrors(finalErrors);
      scrollToFirstFieldError(finalErrors);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const contentPayload = buildContentPayload(content);
      if (mode === "create") {
        const slug = normalizeVillaSlug(basics.slug);
        const retreatId = normalizeVillaSlug(
          basics.retreatId.trim() || basics.slug.trim(),
        );
        if (slug.length < 2) {
          throw new Error("URL slug must be at least 2 characters.");
        }
        const res = await dashboardFetch("/api/dashboard/villas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            retreatId: retreatId.length >= 2 ? retreatId : slug,
            name: basics.name.trim(),
            shortName: basics.shortName.trim(),
            type: basics.type.trim(),
            location: basics.location.trim(),
            thumbnail: basics.thumbnail.trim(),
            status: basics.status,
            bookable: basics.bookable,
            content: contentPayload,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: unknown;
        };
        if (!res.ok) {
          const detail = formatZodValidationError(data.details);
          throw new Error(detail ?? data.error ?? "Create failed");
        }
      } else if (editSlug) {
        const res = await dashboardFetch(`/api/dashboard/villas/${editSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: basics.name.trim(),
            shortName: basics.shortName.trim(),
            type: basics.type.trim(),
            location: basics.location.trim(),
            thumbnail: basics.thumbnail.trim(),
            status: basics.status,
            bookable: basics.bookable,
            content: contentPayload,
            basePriceRupees: operational.basePriceRupees,
            dayOutBasePriceRupees: operational.dayOutBasePriceRupees,
            stayBasePax: operational.stayBasePax,
            dayOutBasePax: operational.dayOutBasePax,
            stayMaxPax: operational.stayMaxPax,
            extraPaxStayRupees: operational.extraPaxStayRupees,
            extraPaxDayOutRupees: operational.extraPaxDayOutRupees,
            taxPercent: operational.taxPercent,
            cleaningFeeRupees: operational.cleaningFeeRupees,
            securityDepositRupees: operational.securityDepositRupees,
            depositPaiseRupees: operational.depositPaiseRupees,
            checkInTime: operational.checkInTime,
            checkOutTime: operational.checkOutTime,
            cancellationPolicy: operational.cancellationPolicy,
            depositPercent: operational.depositPercent,
            weddingVenue: operational.weddingVenue,
            weddingTiers: operational.weddingTiers.map((t) => ({
              id: t.id,
              label: t.label,
              mode: t.mode,
              maxGuests: t.maxGuests,
              priceRupees: t.priceRupees,
              stayIncludedPax: t.stayIncludedPax,
            })),
            addOnAvailability: operational.addOnAvailability,
            displayStats: operational.displayStats,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: unknown;
        };
        if (!res.ok) {
          const detail = formatZodValidationError(data.details);
          throw new Error(detail ?? data.error ?? "Save failed");
        }
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${dash.modalOverlay} z-[var(--dash-z-modal)]`}>
      <div
        className={`property-wizard__shell ${GLASS_CHROME_FRAME_CLASS} relative flex max-h-[min(95dvh,calc(100dvh-2*var(--dash-gutter,1rem)))] w-full max-w-4xl min-h-0 flex-col border border-white/10 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-px block ${GLASS_INNER_SURFACE}`}
        />

        <div className="relative z-10 shrink-0 border-b border-white/10 bg-[#1A1C1E]/90 p-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-manrope text-xs uppercase tracking-widest text-white/40">
                {mode === "create" ? "Add property" : "Full property editor"}
              </p>
              <h2 className="mt-1 font-philosopher text-2xl text-white">
                {basics.shortName || basics.name || "New villa"}
              </h2>
              <p className={hintClass}>
                Saves to MongoDB — listing & detail pages refresh within seconds
                after publish (no manual redeploy).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`${dash.btn} ${dash.btnGhost} ${dash.btnIcon}`}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <DashWizardStepper
              steps={stepperItems}
              onStepClick={loading ? undefined : handleStepClick}
            />
          </div>
        </div>

        <form
          className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSave}
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-white/50">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--dash-accent)]" />
                Loading property…
              </div>
            ) : (
              <DashSectionCard
                title={WIZARD_STEPS[step].label}
                badge={WIZARD_STEPS[step].publicSection}
              >
                <DashFormShell fluid twoColumn={step === 0}>
                {step === 0 && (
                  <>
                    {mode === "create" && (
                      <>
                        <DashFloatingField
                          id="slug"
                          label={FIELD_LABELS.slug.label}
                          value={basics.slug}
                          required
                          onChange={(v) => {
                            setBasics({
                              ...basics,
                              slug: v,
                              retreatId: basics.retreatId || v,
                            });
                          }}
                          {...fieldProps("slug")}
                          onBlur={() => {
                            const v = normalizeVillaSlug(basics.slug);
                            setBasics({
                              ...basics,
                              slug: v,
                              retreatId: basics.retreatId || v,
                            });
                            setTouched((t) => ({ ...t, slug: true }));
                          }}
                        />
                        <p className="col-span-full -mt-2 font-manrope text-xs text-white/45">
                          {FIELD_LABELS.slug.hint}: /retreat/{basics.slug || "slug"}/
                        </p>
                        <DashFloatingField
                          id="retreatId"
                          label={FIELD_LABELS.retreatId.label}
                          value={basics.retreatId}
                          onChange={(v) =>
                            setBasics({
                              ...basics,
                              retreatId: normalizeVillaSlug(v),
                            })
                          }
                          {...fieldProps("retreatId")}
                        />
                        <p className="col-span-full -mt-2 font-manrope text-xs text-white/45">
                          {FIELD_LABELS.retreatId.hint} — underscores become hyphens.
                        </p>
                      </>
                    )}
                    <DashFloatingField
                      id="name"
                      label={FIELD_LABELS.name.label}
                      value={basics.name}
                      required
                      onChange={(name) => {
                        setBasics({
                          ...basics,
                          name,
                          shortName:
                            mode === "create" && !basics.shortName
                              ? name
                              : basics.shortName,
                          slug:
                            mode === "create" && !basics.slug
                              ? slugify(name)
                              : basics.slug,
                        });
                      }}
                      {...fieldProps("name")}
                    />
                    <DashFloatingField
                      id="shortName"
                      label={FIELD_LABELS.shortName.label}
                      value={basics.shortName}
                      required
                      onChange={(shortName) =>
                        setBasics({ ...basics, shortName })
                      }
                      {...fieldProps("shortName")}
                    />
                    <DashFloatingTextarea
                      id="categories"
                      label="Listing filter categories"
                      value={content.categories}
                      rows={3}
                      onChange={(categories) =>
                        setContent({ ...content, categories })
                      }
                    />
                    <VillaFormSection
                      title="Publish settings"
                      description="Maps to villa card visibility on /retreats/."
                      badge="Go live"
                    >
                      <VillaFormGrid cols={1}>
                        <VillaFormSelect
                          label="Public visibility"
                          value={basics.status}
                          onChange={(status) => {
                            setBasics({
                              ...basics,
                              status,
                              ...(status === "hidden" ? { bookable: false } : {}),
                            });
                            if (status === "active" || status === "maintenance") {
                              setContent({
                                ...content,
                                hideFromVillasDirectory: false,
                              });
                            }
                            if (status === "hidden") {
                              setContent({
                                ...content,
                                hideFromVillasDirectory: true,
                              });
                            }
                          }}
                          options={[
                            { value: "active", label: "Live — visible on /retreats/" },
                            { value: "maintenance", label: "Maintenance" },
                            {
                              value: "hidden",
                              label: "Hidden — removed from public site",
                            },
                          ]}
                        />
                        <VillaFormToggle
                          label="Allow online booking"
                          description="Guests can book from the villa card and detail page."
                          checked={basics.bookable}
                          disabled={basics.status === "hidden"}
                          onChange={(bookable) =>
                            setBasics({ ...basics, bookable })
                          }
                        />
                        <VillaFormToggle
                          label="Hide from /retreats/ only"
                          description="Detail page URL still works — useful for direct-link launches."
                          checked={content.hideFromVillasDirectory}
                          disabled={basics.status === "hidden"}
                          onChange={(hide) =>
                            setContent({
                              ...content,
                              hideFromVillasDirectory: hide,
                            })
                          }
                        />
                      </VillaFormGrid>
                    </VillaFormSection>
                    {mode === "edit" && canWrite && deletion ? (
                      <div className="col-span-full mt-4">
                        <VillaDeletePanel
                          slug={basics.slug}
                          name={basics.name}
                          shortName={basics.shortName}
                          allowed={deletion.allowed}
                          blockedReason={deletion.reason}
                          onDeleted={() => {
                            onSaved();
                            onClose();
                          }}
                        />
                      </div>
                    ) : null}
                  </>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <DashFormNotice>
                      Maps to the hero carousel at the top of /retreats/
                      {basics.slug || "your-slug"}. Custom properties show only
                      images you set here — not the media library folder.
                    </DashFormNotice>
                    <div className="col-span-full">
                      <ImageUploadField
                        label={FIELD_LABELS.thumbnail.label}
                        hint={FIELD_LABELS.thumbnail.hint}
                        value={basics.thumbnail}
                        onChange={(url) =>
                          setBasics({ ...basics, thumbnail: url })
                        }
                        villaSlug={slugForUpload}
                        disabled={!canWrite}
                      />
                    </div>
                    <div className={wizardSectionClass}>
                      <label className={labelClass}>
                        {FIELD_LABELS.heroGallery.label}
                      </label>
                      <p className={hintClass}>{FIELD_LABELS.heroGallery.hint}</p>
                      <textarea
                        className={`${inputClass} mt-2 min-h-[80px] font-mono text-sm`}
                        value={content.images}
                        onChange={(e) =>
                          setContent({ ...content, images: e.target.value })
                        }
                        placeholder="/api/cms/media/... or /Villa_Retreats/.../Hero.webp"
                      />
                      <div className="mt-3">
                        <ImageUploadField
                          label="Add hero slide"
                          hint="Upload or pick — appends to the list above."
                          value=""
                          compact
                          onChange={(url) => {
                            if (!url) return;
                            const prev = content.images.trim();
                            setContent({
                              ...content,
                              images: prev ? `${prev}\n${url}` : url,
                            });
                          }}
                          villaSlug={slugForUpload}
                          disabled={!canWrite}
                        />
                      </div>
                    </div>
                    <DashFloatingField
                      id="socialProof"
                      label={FIELD_LABELS.socialProof.label}
                      value={content.socialProof}
                      onChange={(socialProof) =>
                        setContent({ ...content, socialProof })
                      }
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <DashFormNotice>
                      Maps to #overview on the public villa detail page — type,
                      location, stats row, description, and tags.
                    </DashFormNotice>
                    <DashFloatingField
                      id="type"
                      label={FIELD_LABELS.type.label}
                      value={basics.type}
                      onChange={(type) => setBasics({ ...basics, type })}
                      {...fieldProps("type")}
                    />
                    <DashFloatingField
                      id="location"
                      label={FIELD_LABELS.location.label}
                      value={basics.location}
                      onChange={(location) =>
                        setBasics({ ...basics, location })
                      }
                      {...fieldProps("location")}
                    />
                    <div className={dash.formGrid2}>
                      {Object.entries(DISPLAY_STAT_FIELD_LABELS).map(
                        ([key, label]) => (
                          <DashFloatingField
                            key={key}
                            id={`displayStats.${key}`}
                            label={label}
                            value={operational.displayStats[key] ?? ""}
                            onChange={(v) =>
                              setOperational({
                                ...operational,
                                displayStats: {
                                  ...operational.displayStats,
                                  [key]: v,
                                },
                              })
                            }
                          />
                        ),
                      )}
                    </div>
                    <DashFloatingTextarea
                      id="description"
                      label={FIELD_LABELS.description.label}
                      value={content.description}
                      rows={6}
                      onChange={(description) =>
                        setContent({ ...content, description })
                      }
                      {...fieldProps("content.description")}
                    />
                    <DashFloatingTextarea
                      id="perfectForTags"
                      label="Perfect for tags"
                      value={content.perfectForTags}
                      rows={4}
                      onChange={(perfectForTags) =>
                        setContent({ ...content, perfectForTags })
                      }
                    />
                    <p className={hintClass}>One per line — chips below description.</p>
                    <BrochureUploadField
                      url={content.brochureUrl}
                      filename={content.brochureFilename}
                      onChange={(url, filename) =>
                        setContent({
                          ...content,
                          brochureUrl: url,
                          brochureFilename: filename,
                        })
                      }
                      villaSlug={slugForUpload}
                      disabled={!canWrite}
                    />
                  </div>
                )}

                {step === 8 && (
                  <AmenityEditorRows
                    rows={content.amenities}
                    onChange={(amenities) => setContent({ ...content, amenities })}
                    disabled={!canWrite}
                  />
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #spaces on the villa detail page — categorized space
                      galleries only.
                    </DashFormNotice>
                    {content.categorizedSpaces.map((row, i) => (
                      <div key={row.id} className={`${wizardSectionClass} space-y-3`}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className={labelClass}>Space title</label>
                            <input
                              className={inputClass}
                              value={row.title}
                              onChange={(e) => {
                                const next = [...content.categorizedSpaces];
                                next[i] = { ...row, title: e.target.value };
                                setContent({ ...content, categorizedSpaces: next });
                              }}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Category</label>
                            <input
                              className={inputClass}
                              value={row.category}
                              placeholder="Indoor / Outdoor / Pool"
                              onChange={(e) => {
                                const next = [...content.categorizedSpaces];
                                next[i] = { ...row, category: e.target.value };
                                setContent({ ...content, categorizedSpaces: next });
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Space amenities</label>
                          <input
                            className={inputClass}
                            placeholder="Pool, BBQ, Lawn (comma-separated)"
                            value={row.amenities}
                            onChange={(e) => {
                              const next = [...content.categorizedSpaces];
                              next[i] = { ...row, amenities: e.target.value };
                              setContent({ ...content, categorizedSpaces: next });
                            }}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Image paths</label>
                          <textarea
                            className={`${inputClass} min-h-[60px] font-mono text-sm`}
                            value={row.images}
                            onChange={(e) => {
                              const next = [...content.categorizedSpaces];
                              next[i] = { ...row, images: e.target.value };
                              setContent({ ...content, categorizedSpaces: next });
                            }}
                            placeholder="One path per line"
                          />
                        </div>
                        <ImageUploadField
                          label="Add space image"
                          hint="Path, library, or upload — appends to image paths above."
                          value=""
                          compact
                          onChange={(url) => {
                            if (!url) return;
                            const next = [...content.categorizedSpaces];
                            const prev = row.images.trim();
                            next[i] = {
                              ...row,
                              images: prev ? `${prev}\n${url}` : url,
                            };
                            setContent({ ...content, categorizedSpaces: next });
                          }}
                          villaSlug={slugForUpload}
                          disabled={!canWrite}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                      onClick={() =>
                        setContent({
                          ...content,
                          categorizedSpaces: [
                            ...content.categorizedSpaces,
                            {
                              id: `space-${Date.now()}`,
                              title: "",
                              category: "Outdoor",
                              amenities: "",
                              images: "",
                            },
                          ],
                        })
                      }
                    >
                      + Add space
                    </button>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #experiences on the villa detail page.
                    </DashFormNotice>
                    {content.activities.map((row, i) => (
                      <div key={i} className={`${wizardSectionClass} space-y-3`}>
                        <div>
                          <label className={labelClass}>Experience title</label>
                          <input
                            className={inputClass}
                            value={row.title}
                            onChange={(e) => {
                              const next = [...content.activities];
                              next[i] = { ...row, title: e.target.value };
                              setContent({ ...content, activities: next });
                            }}
                          />
                        </div>
                        <ImageUploadField
                          label="Experience image"
                          value={row.image}
                          onChange={(url) => {
                            const next = [...content.activities];
                            next[i] = { ...row, image: url };
                            setContent({ ...content, activities: next });
                          }}
                          villaSlug={slugForUpload}
                          disabled={!canWrite}
                        />
                        <div>
                          <label className={labelClass}>Caption</label>
                          <textarea
                            className={`${inputClass} min-h-[60px]`}
                            value={row.description}
                            onChange={(e) => {
                              const next = [...content.activities];
                              next[i] = { ...row, description: e.target.value };
                              setContent({ ...content, activities: next });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                      onClick={() =>
                        setContent({
                          ...content,
                          activities: [
                            ...content.activities,
                            { title: "", image: "", description: "" },
                          ],
                        })
                      }
                    >
                      + Add experience
                    </button>
                  </div>
                )}

                {step === 10 && (
                  <div className="space-y-5">
                    <DashFormNotice>
                      Maps to #location on the villa detail page.
                    </DashFormNotice>
                    <div className={dash.formGrid2}>
                      <DashFloatingField
                        id="address"
                        label="Street address"
                        value={content.address}
                        onChange={(address) =>
                          setContent({ ...content, address })
                        }
                        className="col-span-full"
                      />
                      <DashFloatingField
                        id="distance"
                        label="Distance summary"
                        value={content.distance}
                        onChange={(distance) =>
                          setContent({ ...content, distance })
                        }
                      />
                      <DashFloatingField
                        id="googleMapsUrl"
                        label="Google Maps URL"
                        type="url"
                        value={content.googleMapsUrl}
                        onChange={(googleMapsUrl) =>
                          setContent({ ...content, googleMapsUrl })
                        }
                      />
                    </div>
                    <ImageUploadField
                      label="Map preview image"
                      hint="Optional static map graphic above the address."
                      value={content.mapImage}
                      onChange={(url) =>
                        setContent({ ...content, mapImage: url })
                      }
                      villaSlug={slugForUpload}
                      disabled={!canWrite}
                    />
                    <NearbyLandmarkRows
                      rows={content.nearbyRows}
                      onChange={(nearbyRows) =>
                        setContent({ ...content, nearbyRows })
                      }
                      disabled={!canWrite}
                    />
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #details on the villa detail page.
                    </DashFormNotice>
                    <div>
                      <label className={labelClass}>Property details</label>
                      <p className={hintClass}>
                        Highlight tiles on villa detail (title + description).
                      </p>
                      <div className="mt-3 space-y-3">
                        {content.propertyDetails.map((row, i) => (
                          <div
                            key={i}
                            className={`${wizardSectionClass} grid gap-3 sm:grid-cols-2`}
                          >
                            <input
                              className={inputClass}
                              placeholder="Title"
                              value={row.title}
                              onChange={(e) => {
                                const next = [...content.propertyDetails];
                                next[i] = { ...row, title: e.target.value };
                                setContent({ ...content, propertyDetails: next });
                              }}
                            />
                            <VillaIconPicker
                              id={`property-detail-icon-${i}`}
                              label="Icon"
                              value={row.icon}
                              disabled={!canWrite}
                              onChange={(icon) => {
                                const next = [...content.propertyDetails];
                                next[i] = { ...row, icon };
                                setContent({ ...content, propertyDetails: next });
                              }}
                            />
                            <input
                              className={`${inputClass} sm:col-span-2`}
                              placeholder="Description"
                              value={row.description}
                              onChange={(e) => {
                                const next = [...content.propertyDetails];
                                next[i] = { ...row, description: e.target.value };
                                setContent({ ...content, propertyDetails: next });
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                          onClick={() =>
                            setContent({
                              ...content,
                              propertyDetails: [
                                ...content.propertyDetails,
                                { title: "", description: "", icon: "Home" },
                              ],
                            })
                          }
                        >
                          + Add property detail
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className={`${wizardSectionClass} space-y-4`}>
                    <DashFormNotice>
                      Maps to #video-walkthrough on the villa detail page.
                    </DashFormNotice>
                    <DashFloatingField
                      id="content.video.youtubeUrl"
                      label={FIELD_LABELS.youtubeUrl.label}
                      value={content.youtubeUrl}
                      onChange={(youtubeUrl) =>
                        setContent({ ...content, youtubeUrl })
                      }
                      {...fieldProps("content.video.youtubeUrl")}
                    />
                    <ImageUploadField
                      label="Video thumbnail"
                      hint="Poster before play — path, media library, or upload."
                      value={content.videoThumbnail}
                      onChange={(url) =>
                        setContent({ ...content, videoThumbnail: url })
                      }
                      villaSlug={slugForUpload}
                      disabled={!canWrite}
                    />
                    <DashFloatingField
                      id="videoDuration"
                      label={FIELD_LABELS.videoDuration.label}
                      value={content.videoDuration}
                      onChange={(videoDuration) =>
                        setContent({ ...content, videoDuration })
                      }
                    />
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #services on the villa detail page.
                    </DashFormNotice>
                    <div>
                      <label className={labelClass}>Services</label>
                      <div className="mt-3 space-y-3">
                        {content.services.map((row, i) => (
                          <div key={i} className={`${wizardSectionClass} grid gap-3`}>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>Title</label>
                                <input
                                  className={inputClass}
                                  value={row.title}
                                  onChange={(e) => {
                                    const next = [...content.services];
                                    next[i] = { ...row, title: e.target.value };
                                    setContent({ ...content, services: next });
                                  }}
                                />
                              </div>
                              <VillaIconPicker
                                id={`service-icon-${i}`}
                                label="Icon"
                                value={row.icon}
                                disabled={!canWrite}
                                onChange={(icon) => {
                                  const next = [...content.services];
                                  next[i] = { ...row, icon };
                                  setContent({ ...content, services: next });
                                }}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Description</label>
                              <textarea
                                className={`${inputClass} min-h-[60px]`}
                                value={row.description}
                                onChange={(e) => {
                                  const next = [...content.services];
                                  next[i] = { ...row, description: e.target.value };
                                  setContent({ ...content, services: next });
                                }}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Footer note</label>
                              <input
                                className={inputClass}
                                value={row.footer}
                                placeholder="Optional small print under description"
                                onChange={(e) => {
                                  const next = [...content.services];
                                  next[i] = { ...row, footer: e.target.value };
                                  setContent({ ...content, services: next });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                          onClick={() =>
                            setContent({
                              ...content,
                              services: [
                                ...content.services,
                                {
                                  title: "",
                                  description: "",
                                  footer: "",
                                  icon: "Sparkles",
                                },
                              ],
                            })
                          }
                        >
                          + Add service
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 9 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #perfect-for on the villa detail page.
                    </DashFormNotice>
                    <div className="space-y-4">
                      {content.perfectForCards.map((row, i) => (
                        <div
                          key={i}
                          className={`${wizardSectionClass} grid gap-3 sm:grid-cols-2`}
                        >
                          <div>
                            <label className={labelClass}>Card title</label>
                            <input
                              className={inputClass}
                              value={row.title}
                              onChange={(e) => {
                                const next = [...content.perfectForCards];
                                next[i] = { ...row, title: e.target.value };
                                setContent({ ...content, perfectForCards: next });
                              }}
                            />
                          </div>
                          <ImageUploadField
                            label="Card image"
                            value={row.image}
                            onChange={(url) => {
                              const next = [...content.perfectForCards];
                              next[i] = { ...row, image: url };
                              setContent({ ...content, perfectForCards: next });
                            }}
                            villaSlug={slugForUpload}
                            disabled={!canWrite}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                        onClick={() =>
                          setContent({
                            ...content,
                            perfectForCards: [
                              ...content.perfectForCards,
                              { title: "", image: "" },
                            ],
                          })
                        }
                      >
                        + Add perfect-for card
                      </button>
                    </div>
                  </div>
                )}

                {step === 11 && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #faq on the villa detail page.
                    </DashFormNotice>
                    {content.faq.map((row, i) => (
                      <div key={i} className="grid gap-3 sm:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Question"
                          value={row.question}
                          onChange={(e) => {
                            const next = [...content.faq];
                            next[i] = { ...row, question: e.target.value };
                            setContent({ ...content, faq: next });
                          }}
                        />
                        <input
                          className={inputClass}
                          placeholder="Answer"
                          value={row.answer}
                          onChange={(e) => {
                            const next = [...content.faq];
                            next[i] = { ...row, answer: e.target.value };
                            setContent({ ...content, faq: next });
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                      onClick={() =>
                        setContent({
                          ...content,
                          faq: [...content.faq, { question: "", answer: "" }],
                        })
                      }
                    >
                      + Add FAQ
                    </button>
                  </div>
                )}

                {step === WIZARD_FINAL_STEP && (
                  <div className="space-y-6">
                    <DashFormNotice>
                      Maps to #pricing on the villa detail page. Same fields as Quick
                      Edit — changes here update the same MongoDB record.
                    </DashFormNotice>
                    <VillaOperationalFields
                      villa={{
                        ...operational,
                        name: basics.name,
                        shortName: basics.shortName,
                        slug: basics.slug,
                        retreatId: basics.retreatId,
                        type: basics.type,
                        location: basics.location,
                        thumbnail: basics.thumbnail,
                        status: basics.status,
                        bookable: basics.bookable,
                        content: buildContentPayload(content),
                        id: basics.slug,
                        portfolioSource: null,
                        notes: "",
                        axisRooms: channelMeta.axisRooms,
                        channelMode: channelMeta.channelMode,
                        channelState: channelMeta.channelState,
                        updatedAt: null,
                      }}
                      canWrite={canWrite}
                      fp={operationalFieldProps}
                      onPatch={(patch) =>
                        setOperational((prev) => ({
                          ...prev,
                          ...patch,
                          displayStats: patch.displayStats ?? prev.displayStats,
                          weddingTiers: patch.weddingTiers ?? prev.weddingTiers,
                          addOnAvailability:
                            patch.addOnAvailability ?? prev.addOnAvailability,
                        }))
                      }
                      onSetNum={(key, value) =>
                        setOperational((prev) => ({
                          ...prev,
                          [key]: Number(value),
                        }))
                      }
                      onUpdateTier={(tierId, patch) =>
                        setOperational((prev) => ({
                          ...prev,
                          weddingTiers: prev.weddingTiers.map((t) =>
                            t.id === tierId ? { ...t, ...patch } : t,
                          ),
                        }))
                      }
                      onToggleAddOn={(id) =>
                        setOperational((prev) => ({
                          ...prev,
                          addOnAvailability: prev.addOnAvailability.includes(id)
                            ? prev.addOnAvailability.filter((x) => x !== id)
                            : [...prev.addOnAvailability, id],
                        }))
                      }
                    />
                    <div className="border border-[var(--dash-accent-border)]/40 bg-[var(--dash-accent-muted)]/30 p-4">
                      <p className={labelClass}>Go-live checklist</p>
                      <ul className="mt-2 space-y-2 font-manrope text-sm text-white/75">
                        <li>
                          {basics.status === "active" ? "✓" : "○"} Set visibility to{" "}
                          <strong className="text-white">Live</strong> for /retreats/ listing
                        </li>
                        <li>
                          {basics.bookable ? "✓" : "○"} Enable online booking if guests
                          should use /book
                        </li>
                        <li>
                          ○ Add Axis Rooms IDs in{" "}
                          <Link
                            href="/dashboard/settings/staah"
                            className="text-[var(--dash-accent)] hover:underline"
                          >
                            Axis Rooms settings
                          </Link>
                        </li>
                        <li>
                          {previewId ? "✓" : "○"} Preview public page before sharing links
                        </li>
                      </ul>
                    </div>
                    {previewId && (
                      <a
                        href={`/retreat/${previewId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-manrope text-sm text-[var(--dash-accent)] hover:underline"
                      >
                        Preview public page
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}

                {error ? (
                  <DashFormNotice variant="danger">{error}</DashFormNotice>
                ) : null}
                </DashFormShell>
              </DashSectionCard>
            )}
          </div>

          <DashFormActionBar>
            <button
              type="button"
              onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
              className={`${dash.btn} ${dash.btnText}`}
            >
              {step > 0 ? "Back" : "Cancel"}
            </button>
            <div className="flex gap-2">
              {step < WIZARD_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`${dash.btn} ${dash.btnAccent}`}
                >
                  Next
                </button>
              ) : (
                canWrite && (
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className={`${dash.btn} ${dash.btnAccent}`}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {mode === "create" ? "Create property" : "Save & publish"}
                  </button>
                )
              )}
            </div>
          </DashFormActionBar>
        </form>
      </div>
    </div>
  );
}
