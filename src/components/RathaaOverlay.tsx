"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Facebook,
  Instagram,
  Youtube,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import {
  OVERLAY_DISMISS_ABOVE_SHEET_MOBILE_CLASS,
  OVERLAY_DISMISS_BUTTON_VIEWPORT_TOP_CLASS,
} from "@/lib/overlayDismissButton";
import { useAnimation } from "@/context/AnimationContext";
import { OCCASION_OPTIONS } from "@/lib/enquiryFormOptions";
import { sanitizeGuestCountInput } from "@/lib/guestCountInput";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  isRathaaFormValid,
  rathaaFieldErrors,
  type RathaaFieldKey,
} from "@/lib/leadFormValidation";
import {
  JadeFloatingField,
  JadeFloatingSelect,
  JadeFloatingTextarea,
} from "@/components/ui/form";
import { OVERLAY_MOBILE_FORM_SCROLL_PAD_CLASS } from "@/lib/overlayMobileChrome";
import { useOverlayMobileChrome } from "@/lib/useOverlayMobileChrome";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";

export default function RathaaOverlay() {
  const { isRathaaOverlayOpen, setRathaaOverlayOpen } = useAnimation();
  useOverlayMobileChrome(isRathaaOverlayOpen);
  const [view, setView] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    guests: "",
    preferredDate: "",
    travelFormat: {
      oneDay: false,
      overnight: false,
      multiDay: false,
    },
    occasionType: "",
    specialRequests: "",
  });

  const handleClose = () => {
    setRathaaOverlayOpen(false);
    setTimeout(() => {
      setView("form");
      setSubmitting(false);
      setSubmitError(null);
      setAttemptedSubmit(false);
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        guests: "",
        preferredDate: "",
        travelFormat: {
          oneDay: false,
          overnight: false,
          multiDay: false,
        },
        occasionType: "",
        specialRequests: "",
      });
    }, 500);
  };

  const fieldErrors = useMemo(
    () => rathaaFieldErrors(formData),
    [formData],
  );

  const showFieldError = (key: RathaaFieldKey) =>
    attemptedSubmit && Boolean(fieldErrors[key]);

  const formValid = isRathaaFormValid(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!formValid) return;
    setView("success");
  };

  const toggleFormat = (key: keyof typeof formData.travelFormat) => {
    setFormData((prev) => ({
      ...prev,
      travelFormat: {
        ...prev.travelFormat,
        [key]: !prev.travelFormat[key],
      },
    }));
  };

  if (!isRathaaOverlayOpen) return null;

  return (
    <AnimatePresence>
      {isRathaaOverlayOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Desktop: viewport-top dismiss */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClose}
            className={`hidden md:flex ${OVERLAY_DISMISS_BUTTON_VIEWPORT_TOP_CLASS}`}
            aria-label="Close"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </motion.button>

          <div
            className="fixed inset-0 z-[101] flex flex-col items-center justify-end md:justify-center px-4 md:px-0 pointer-events-none"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Mobile: dismiss sits just above the sheet lip */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClose}
              className={OVERLAY_DISMISS_ABOVE_SHEET_MOBILE_CLASS}
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </motion.button>

            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative pointer-events-auto w-full md:w-[600px] max-md:h-[80svh] md:h-[82vh] md:max-h-[760px] bg-jade-green flex flex-col font-manrope rounded-t-2xl md:rounded-lg shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,205,98,0.05)_0%,transparent_50%)] pointer-events-none" />
              {/* CONTENT AREA */}
              <div
                className={`flex-1 overflow-y-auto scrollbar-hide px-6 pt-5 ${OVERLAY_MOBILE_FORM_SCROLL_PAD_CLASS}`}
                data-lenis-prevent
              >
                {view === "form" ? (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col h-full"
                  >
                    <h2 className="text-white text-[32px] leading-tight md:text-gh-h2 font-philosopher mb-2.5">
                      Plan Your Rathaa Journey
                    </h2>
                    <p className="text-white/80 text-gh-body mb-6">
                      Tell us your preferred dates, group size, and destination.
                      Our team will help you design a curated caravan
                      experience.
                    </p>

                    <div className="flex flex-col gap-4 flex-1">
                      <JadeFloatingField
                        id="rathaa-fullName"
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
                        id="rathaa-phone"
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
                        id="rathaa-email"
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
                        id="rathaa-guests"
                        label="Number of Guests"
                        inputMode="numeric"
                        value={formData.guests}
                        onChange={(v) =>
                          setFormData({
                            ...formData,
                            guests: sanitizeGuestCountInput(v),
                          })
                        }
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.guests)}
                        showError={showFieldError("guests")}
                        errorMessage={fieldErrors.guests}
                      />
                      <div className="relative">
                        <JadeFloatingField
                          id="rathaa-date"
                          label="Preferred Date"
                          value={formData.preferredDate}
                          onChange={(v) =>
                            setFormData({ ...formData, preferredDate: v })
                          }
                          theme="overlayGreen"
                          invalid={Boolean(fieldErrors.preferredDate)}
                          showError={showFieldError("preferredDate")}
                          errorMessage={fieldErrors.preferredDate}
                          className="[&_input]:pr-12"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                      </div>

                      <div className="mt-2 text-white">
                        <h3 className="text-white text-gh-body mb-3">
                          Travel Format:
                        </h3>
                        <div className="flex flex-col gap-2.5">
                          {[
                            {
                              key: "oneDay",
                              label: "One-Day Caravan Experience",
                            },
                            {
                              key: "overnight",
                              label: "Overnight Caravan Retreat",
                            },
                            {
                              key: "multiDay",
                              label: "Multi-Day Curated Journeys",
                            },
                          ].map((item) => (
                            <label
                              key={item.key}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFormat(
                                  item.key as keyof typeof formData.travelFormat,
                                );
                              }}
                              className="flex items-center gap-2.5 cursor-pointer group"
                            >
                              <div
                                className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors shrink-0 bg-[#0E2E23] ${formData.travelFormat[item.key as keyof typeof formData.travelFormat] ? "border-white bg-white" : "border-white/40 group-hover:border-white/80"}`}
                              >
                                {formData.travelFormat[
                                  item.key as keyof typeof formData.travelFormat
                                ] && (
                                  <Check
                                    className="w-3.5 h-3.5 text-[#123A2D]"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <span className="text-white/90 text-[15px] group-hover:text-white transition-colors">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {showFieldError("travelFormat") &&
                      fieldErrors.travelFormat ? (
                        <JadeFormFieldError
                          id="rathaa-travel-err"
                          message={fieldErrors.travelFormat}
                        />
                      ) : null}

                      <JadeFloatingSelect
                        id="rathaa-occasion"
                        label="Occasion type"
                        value={formData.occasionType}
                        onChange={(v) =>
                          setFormData({ ...formData, occasionType: v })
                        }
                        options={OCCASION_OPTIONS}
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.occasionType)}
                        showError={showFieldError("occasionType")}
                        errorMessage={fieldErrors.occasionType}
                      />

                      <JadeFloatingTextarea
                        id="rathaa-notes"
                        label="Special requests (optional)"
                        required={false}
                        value={formData.specialRequests}
                        onChange={(v) =>
                          setFormData({ ...formData, specialRequests: v })
                        }
                        theme="overlayGreen"
                        invalid={Boolean(fieldErrors.specialRequests)}
                        showError={showFieldError("specialRequests")}
                        errorMessage={fieldErrors.specialRequests}
                      />
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      {submitError && (
                        <p
                          role="alert"
                          className="mb-3 text-sm text-red-300 border border-red-400/40 rounded-sm px-3 py-2 text-left"
                        >
                          {submitError}
                        </p>
                      )}
                      <p className="text-[11px] text-white/30 pb-4 text-center font-manrope">
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
                        type="submit"
                        width="form"
                        withArrow={false}
                        disabled={!formValid || submitting}
                      >
                        {submitting ? "SENDING…" : "SEND INQUIRY"}
                      </PrimaryButton>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-4 text-center pb-6">
                    {/* Glassy circular wrapper for the checkmark */}
                    <div className="w-[180px] h-[180px] shrink-0 relative mb-6 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/20 backdrop-blur-md shadow-2xl">
                      <div className="w-[84px] h-[84px] shrink-0 relative drop-shadow-2xl">
                        <Image
                          src="/assets/JAde%20Correction.png"
                          alt="Success Check"
                          fill
                          sizes="96px"
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <h2 className="text-white text-shadow-sm text-[36px] font-philosopher mb-3">
                      We've got it from here
                    </h2>

                    <p className="text-white/90 text-[16px] leading-relaxed mb-10 max-w-sm mx-auto">
                      Thanks for sharing your details!
                      <br />
                      Our team will take a look and reach out shortly to
                      understand things better.
                    </p>

                    <div className="flex flex-col w-full max-w-[300px] mx-auto mt-auto">
                      <p className="text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
                        MEANWHILE CHECK US OUT HERE
                      </p>

                      <div className="flex justify-center gap-3">
                        {[
                          {
                            Icon: Facebook,
                            href: "https://www.facebook.com/jadehospitainment/",
                          },
                          {
                            Icon: Instagram,
                            href: "https://www.instagram.com/jadehospitainment/?hl=en",
                          },
                          {
                            Icon: Youtube,
                            href: "https://www.youtube.com/@jade_hospitainment",
                          },
                        ].map(({ Icon, href }, i) => (
                          <a
                            key={i}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white/5 border border-white/20 flex items-center justify-center hover:bg-[#EFCD62] hover:text-black transition-all"
                          >
                            <Icon className="w-5 h-5" />
                          </a>
                        ))}
                      </div>

                      <p className="text-white/60 text-[13px] mb-8 mt-5">
                        Thoughtfully operated. Always.
                      </p>

                      <PrimaryButton
                        withArrow={false}
                        width="form"
                        onClick={handleClose}
                      >
                        OKAY
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
