"use client";

import { useMemo, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import FormOverlayLayout from "@/components/overlays/FormOverlayLayout";
import OverlayEnquirySuccessContent from "@/components/overlays/OverlayEnquirySuccessContent";
import { useAnimation } from "@/context/AnimationContext";
import Link from "next/link";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  isPartnerFormValid,
  partnerFieldErrors,
  type PartnerFormValues,
} from "@/lib/leadFormValidation";
import { formatSubmitError } from "@/lib/submitErrorMessage";
import {
  JadeFloatingField,
  JadeFloatingTextarea,
  JadeFormFieldError,
} from "@/components/ui/form";
import PartnerImageUpload from "@/components/partner/PartnerImageUpload";
import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";
export default function PartnerOverlay() {
  const { isPartnerOverlayOpen, setPartnerOverlayOpen } = useAnimation();
  const [view, setView] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<
    { file: File; preview: string }[]
  >([]);

  const [formData, setFormData] = useState<PartnerFormValues>({
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
  });

  const handleClose = () => {
    setPartnerOverlayOpen(false);
    // Reset view back to form after animation completes
    setTimeout(() => {
      setView("form");
      setSubmitting(false);
      setSubmitError(null);
      setAttemptedSubmit(false);
      setSelectedImages([]); // Clear previews on close
      setFormData({
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
      });
    }, 500);
  };

  const fieldErrors = useMemo(
    () => partnerFieldErrors(formData, selectedImages.length),
    [formData, selectedImages.length],
  );

  const formValid = useMemo(
    () => isPartnerFormValid(formData, selectedImages.length),
    [formData, selectedImages.length],
  );

  const showFieldError = (key: keyof typeof fieldErrors) =>
    attemptedSubmit && Boolean(fieldErrors[key]);

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    setSubmitError(null);
    if (!formValid || submitting) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("meta", JSON.stringify(formData));
      for (const row of selectedImages) {
        fd.append("photos", row.file);
      }
      const res = await fetch("/api/leads/partner", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Submission failed.");
      }

      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setView("success");
    } catch (e) {
      setSubmitError(
        formatSubmitError(e, "Something went wrong. Try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 6));
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const togglePartnership = (key: keyof typeof formData.partnershipType) => {
    setFormData((prev) => ({
      ...prev,
      partnershipType: {
        ...prev.partnershipType,
        [key]: !prev.partnershipType[key],
      },
    }));
  };

  const togglePropertyType = (key: keyof typeof formData.propertyType) => {
    setFormData((prev) => ({
      ...prev,
      propertyType: {
        ...prev.propertyType,
        [key]: !prev.propertyType[key],
      },
    }));
  };

  if (!isPartnerOverlayOpen) return null;

  return (
    <AnimatePresence>
      {isPartnerOverlayOpen && (
        <FormOverlayLayout
          onClose={handleClose}
          showSheetTopEdgeShade={view === "form"}
          desktopModalClassName={
            view === "success" ? "md:h-[650px]" : undefined
          }
        >
              {view === "form" ? (
                  <div className="flex flex-col px-6 pb-6 md:pt-5">
                    <h2 className="text-white text-gh-h2 font-philosopher md:mb-0 mb-1">
                      Partner with us
                    </h2>
                    <p className="text-white/80 text-gh-body mb-5 mt-2">
                      Share a few details. Our team will get back to you shortly
                    </p>

                    <div className="flex flex-col gap-3">
                      <JadeFloatingField
                        id="partner-fullName"
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(v) =>
                          setFormData({ ...formData, fullName: v })
                        }
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.fullName)}
                        showError={showFieldError("fullName")}
                        errorMessage={fieldErrors.fullName}
                      />
                      <JadeFloatingField
                        id="partner-phone"
                        label="Phone Number"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={formData.phoneNumber}
                        onChange={(v) =>
                          setFormData({
                            ...formData,
                            phoneNumber: sanitizePhoneDigitsInput(v),
                          })
                        }
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.phoneNumber)}
                        showError={showFieldError("phoneNumber")}
                        errorMessage={fieldErrors.phoneNumber}
                      />
                      <JadeFloatingField
                        id="partner-email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(v) =>
                          setFormData({ ...formData, email: v })
                        }
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.email)}
                        showError={showFieldError("email")}
                        errorMessage={fieldErrors.email}
                      />
                      <JadeFloatingField
                        id="partner-company"
                        label="Company/Organization"
                        required={false}
                        value={formData.company}
                        onChange={(v) =>
                          setFormData({ ...formData, company: v })
                        }
                        theme="overlayGreen"
                      />

                      {/* Partnership Type Checkboxes */}
                      <div className="mt-3">
                        <h3 className="text-white text-gh-body mb-2.5">
                          Partnership Type:
                        </h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                          {[
                            { key: "propertyOwner", label: "Property Owner" },
                            { key: "weddingPlanner", label: "Wedding Planner" },
                            {
                              key: "corporatePartner",
                              label: "Corporate Partner",
                            },
                            {
                              key: "musicEntertainment",
                              label: "Music & Entertainment",
                            },
                          ].map((item) => (
                            <label
                              key={item.key}
                              onClick={(e) => {
                                e.preventDefault();
                                togglePartnership(
                                  item.key as keyof typeof formData.partnershipType,
                                );
                              }}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div
                                className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${formData.partnershipType[item.key as keyof typeof formData.partnershipType] ? "bg-white border-white" : "border-white group-hover:border-white/70"}`}
                              >
                                {formData.partnershipType[
                                  item.key as keyof typeof formData.partnershipType
                                ] && (
                                  <Check
                                    className="w-3 h-3 text-jade-green"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <span className="text-white/90 text-gh-label leading-none group-hover:text-white transition-colors tracking-wide">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <JadeFloatingTextarea
                          id="partner-partnership-other"
                          label="Other"
                          required={false}
                          value={formData.partnershipOther}
                          onChange={(v) =>
                            setFormData({ ...formData, partnershipOther: v })
                          }
                          theme="overlayGreen"
                          className="mt-3"
                        />
                        {showFieldError("partnershipType") &&
                        fieldErrors.partnershipType ? (
                          <JadeFormFieldError
                            id="partner-partnership-err"
                            message={fieldErrors.partnershipType}
                          />
                        ) : null}
                      </div>

                      {/* Property Type Checkboxes */}
                      <div
                        className={`mt-2 text-white rounded-sm ${showFieldError("propertyType") ? "border-2 border-[#D32C55] p-3 -mx-1" : ""}`}
                      >
                        <h3 className="text-white text-gh-body mb-2.5">
                          Property Type
                          {showFieldError("propertyType") ? (
                            <span
                              className="ml-1"
                              style={{ color: JADE_FORM_WARN }}
                              aria-hidden
                            >
                              *
                            </span>
                          ) : null}
                        </h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                          {[
                            { key: "privateVilla", label: "Private Villa" },
                            { key: "farmhouse", label: "Farmhouse" },
                            {
                              key: "villaInGated",
                              label: "Villa in gated community",
                            },
                            { key: "retreatSpace", label: "Retreat Space" },
                          ].map((item) => (
                            <label
                              key={item.key}
                              onClick={(e) => {
                                e.preventDefault();
                                togglePropertyType(
                                  item.key as keyof typeof formData.propertyType,
                                );
                              }}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div
                                className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${formData.propertyType[item.key as keyof typeof formData.propertyType] ? "bg-white border-white" : "border-white group-hover:border-white/70"}`}
                              >
                                {formData.propertyType[
                                  item.key as keyof typeof formData.propertyType
                                ] && (
                                  <Check
                                    className="w-3 h-3 text-jade-green"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <span className="text-white/90 text-gh-label leading-none group-hover:text-white transition-colors tracking-wide">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <JadeFloatingTextarea
                          id="partner-property-other"
                          label="Other"
                          required={false}
                          value={formData.propertyOther}
                          onChange={(v) =>
                            setFormData({ ...formData, propertyOther: v })
                          }
                          theme="overlayGreen"
                          className="mt-3"
                        />
                        {showFieldError("propertyType") &&
                        fieldErrors.propertyType ? (
                          <JadeFormFieldError
                            id="partner-property-type-err"
                            message={fieldErrors.propertyType}
                          />
                        ) : null}
                      </div>

                      {/* Property Details */}
                      <div className="mt-2 flex flex-col gap-3 text-white">
                        <h3 className="text-white text-gh-body mb-0">
                          Property Details
                        </h3>
                        <JadeFloatingField
                          id="partner-location"
                          label="Location"
                          value={formData.propertyDetails.location}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              propertyDetails: {
                                ...formData.propertyDetails,
                                location: v,
                              },
                            })
                          }
                          theme="overlayGreen"
                          invalid={Boolean(fieldErrors.propertyLocation)}
                          showError={showFieldError("propertyLocation")}
                          errorMessage={fieldErrors.propertyLocation}
                        />
                        <JadeFloatingField
                          id="partner-bedrooms"
                          label="Number of Bedrooms"
                          value={formData.propertyDetails.bedrooms}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              propertyDetails: {
                                ...formData.propertyDetails,
                                bedrooms: v,
                              },
                            })
                          }
                          theme="overlayGreen"
                          invalid={Boolean(fieldErrors.propertyBedrooms)}
                          showError={showFieldError("propertyBedrooms")}
                          errorMessage={fieldErrors.propertyBedrooms}
                        />
                        <JadeFloatingField
                          id="partner-capacity"
                          label="Outdoor Event Capacity"
                          value={formData.propertyDetails.eventCapacity}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              propertyDetails: {
                                ...formData.propertyDetails,
                                eventCapacity: v,
                              },
                            })
                          }
                          theme="overlayGreen"
                          invalid={Boolean(fieldErrors.propertyEventCapacity)}
                          showError={showFieldError("propertyEventCapacity")}
                          errorMessage={fieldErrors.propertyEventCapacity}
                        />
                      </div>

                      <PartnerImageUpload
                        images={selectedImages}
                        error={fieldErrors.photos}
                        showError={showFieldError("photos")}
                        inputRef={fileInputRef}
                        onPickFiles={handleFileChange}
                        onRemove={removeImage}
                      />

                      {submitError && (
                        <p
                          role="alert"
                          className="text-sm text-red-300 border border-red-400/40 rounded-sm px-3 py-2"
                        >
                          {submitError}
                        </p>
                      )}

                      <p className="text-[11px] text-white/30 pt-2 text-center font-manrope">
                        By proceeding, you agree to our{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-[#EFCD62] hover:underline"
                          onClick={handleClose}
                        >
                          Privacy Policy
                        </Link>
                        ,{" "}
                        <Link
                          href="/terms-conditions"
                          className="text-[#EFCD62] hover:underline"
                          onClick={handleClose}
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/refund-policy"
                          className="text-[#EFCD62] hover:underline"
                          onClick={handleClose}
                        >
                          Refund Policy
                        </Link>
                      </p>

                      <PrimaryButton
                        width="form"
                        withArrow={false}
                        className="mt-2"
                        onClick={() => {
                          void handleSubmit();
                        }}
                        disabled={!formValid || submitting}
                        aria-disabled={!formValid || submitting}
                      >
                        {submitting ? "SENDING…" : "SUBMIT"}
                      </PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <OverlayEnquirySuccessContent embedded onOkay={handleClose} />
                )}
        </FormOverlayLayout>
      )}
    </AnimatePresence>
  );
}
