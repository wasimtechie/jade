"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PrimaryButton from "@/components/PrimaryButton";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import EnquiryDateRangePicker from "@/components/enquiry/EnquiryDateRangePicker";
import { STICKY_BOOKING_BAR_FOOTER_PAD_CLASS } from "@/lib/layoutSpacing";
import { formatPreferredDateRange } from "@/lib/enquiryDateRange";
import { formatSubmitError } from "@/lib/submitErrorMessage";
import { OCCASION_OPTIONS } from "@/lib/enquiryFormOptions";
import { sanitizeGuestCountInput } from "@/lib/guestCountInput";
import { sanitizePhoneDigitsInput } from "@/lib/phoneNumberInput";
import {
  footerFieldErrors,
  isFooterFormValid,
  type FooterFieldKey,
} from "@/lib/leadFormValidation";
import { JADE_FORM_WARN } from "@/lib/jadeFormTokens";
import { resolveEnquiryOkayReturnPath } from "@/lib/enquiryReturnPath";
import {
  JadeFloatingField,
  JadeFloatingSelect,
  JadeFloatingTextarea,
} from "@/components/ui/form";
import JadeFormFieldError from "@/components/ui/form/JadeFormFieldError";
import GoldAccentLine from "@/components/ui/GoldAccentLine";

type FooterProps = {
  /** Tighter bottom padding when a fixed booking bar sits above the footer */
  stickyBottomBar?: boolean;
};

export default function Footer({ stickyBottomBar = false }: FooterProps) {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    noOfGuests: "",
    occasionType: "",
    queries: "",
  });

  // ── Calendar state ─────────────────────────────────────────────────────────
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const fieldErrors = useMemo(
    () => footerFieldErrors(formData, checkIn, consent),
    [formData, checkIn, consent],
  );

  const onlyConsentMissing = useMemo(() => {
    const withoutConsent = footerFieldErrors(formData, checkIn, true);
    return Object.keys(withoutConsent).length === 0 && !consent;
  }, [formData, checkIn, consent]);

  const showFieldError = (key: FooterFieldKey) => {
    if (!fieldErrors[key]) return false;
    if (key === "consent") return onlyConsentMissing;
    if (key === "preferredDate") return checkIn !== null;
    if (key === "fullName") return formData.fullName.trim().length > 0;
    if (key === "phoneNumber") return formData.phoneNumber.trim().length > 0;
    if (key === "noOfGuests") return formData.noOfGuests.trim().length > 0;
    if (key === "occasionType") return formData.occasionType.length > 0;
    if (key === "queries") return formData.queries.trim().length > 0;
    return false;
  };

  const formValid = isFooterFormValid(formData, checkIn, consent);

  const handleFooterSuccessOkay = () => {
    const returnPath = resolveEnquiryOkayReturnPath();
    setIsSuccess(false);
    router.push(returnPath);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "general_enquiry",
          payload: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            guests: formData.noOfGuests,
            occasionType: formData.occasionType,
            preferredDate: formatPreferredDateRange(checkIn, checkOut) || undefined,
            queries: formData.queries,
            travelFormat: {},
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setIsSuccess(true);
      setFormData({
        fullName: "",
        phoneNumber: "",
        noOfGuests: "",
        occasionType: "",
        queries: "",
      });
      setCheckIn(null);
      setCheckOut(null);
      setConsent(false);
    } catch (err) {
      setSubmitError(
        formatSubmitError(err, "Unable to send inquiry."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const LINKS_COLUMN_1 = [
    { label: "RETREATS", href: "/retreats/" },
    { label: "EXPERIENCES", href: "/experiences" },
    { label: "ABOUT", href: "/about" },
  ];

  const LINKS_COLUMN_2 = [
    { label: "PRIVACY POLICY", href: "/privacy-policy" },
    { label: "TERMS & CONDITIONS", href: "/terms-conditions" },
    { label: "REFUND POLICY", href: "/refund-policy" },
  ];

  const footerNavLinkClass =
    "font-manrope text-gh-label text-[#EFCD62]/85 tracking-widest uppercase hover:text-[#EFCD62] transition-colors inline-flex items-center gap-2 lg:text-gh-desc lg:text-[#EFCD62] lg:tracking-[0.16em] lg:hover:text-[#EFCD62]/80 lg:gap-2 lg:whitespace-nowrap";

  return (
    <>
      <footer
        className="relative z-20 overflow-x-hidden"
        style={{ backgroundColor: "#2E3034" }}
      >
        <GoldAccentLine />

        {/* Background Watermark */}
        <div className="absolute top-1/2 right-0 w-[700px] h-[700px] opacity-[0.025] pointer-events-none -translate-y-1/2 translate-x-1/4">
          <Image
            src="/assets/Golden_Logo.png"
            alt="Watermark"
            fill
            sizes="700px"
            className="object-contain"
          />
        </div>

        {/* ── FORM SECTION ─────────────────────────────────────────────── */}
        <div
          className={clsx(
            "max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10 pt-10 lg:pt-20",
            stickyBottomBar
              ? STICKY_BOOKING_BAR_FOOTER_PAD_CLASS
              : "max-lg:pb-[max(1rem,calc(5.375rem+env(safe-area-inset-bottom,0px)))] lg:pb-16",
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* LEFT: Heading + (Desktop) Links + Contact */}
            {/* LEFT: Heading + Contact Form */}
            <div className="lg:col-span-7 flex flex-col gap-10 lg:pr-12">
              {/* Heading */}
              <div>
                <h2 className="font-philosopher text-gh-h1 text-white leading-tight lg:whitespace-nowrap">
                  We&apos;d love to hear from <br className="lg:hidden" />
                  you
                </h2>
              </div>

              {/* Form Content */}
              <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={handleFormSubmit}
              >
                <JadeFloatingField
                  id="footer-fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(v) =>
                    setFormData({ ...formData, fullName: v })
                  }
                  theme="footerCharcoal"
                  invalid={Boolean(fieldErrors.fullName)}
                  showError={showFieldError("fullName")}
                  errorMessage={fieldErrors.fullName}
                />

                <JadeFloatingField
                  id="footer-phone"
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
                  theme="footerCharcoal"
                  invalid={Boolean(fieldErrors.phoneNumber)}
                  showError={showFieldError("phoneNumber")}
                  errorMessage={fieldErrors.phoneNumber}
                />

                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="relative z-20 min-w-0 flex flex-col gap-1.5">
                    <EnquiryDateRangePicker
                      label="Check-In & Out Date"
                      theme="footer"
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onDatesChange={(inDate, outDate) => {
                        setCheckIn(inDate);
                        setCheckOut(outDate);
                      }}
                      invalid={
                        Boolean(fieldErrors.preferredDate) &&
                        showFieldError("preferredDate")
                      }
                      className="min-w-0"
                    />
                    {showFieldError("preferredDate") &&
                    fieldErrors.preferredDate ? (
                      <JadeFormFieldError
                        id="footer-date-err"
                        message={fieldErrors.preferredDate}
                      />
                    ) : null}
                  </div>

                  <JadeFloatingField
                    id="footer-guests"
                    name="noOfGuests"
                    label="No. Of Guests"
                    inputMode="numeric"
                    autoComplete="off"
                    value={formData.noOfGuests}
                    onChange={(v) =>
                      setFormData({
                        ...formData,
                        noOfGuests: sanitizeGuestCountInput(v),
                      })
                    }
                    theme="footerCharcoal"
                    className="min-w-0"
                    invalid={Boolean(fieldErrors.noOfGuests)}
                    showError={showFieldError("noOfGuests")}
                    errorMessage={fieldErrors.noOfGuests}
                  />
                </div>

                <JadeFloatingSelect
                  id="footer-occasion"
                  label="Occasion type"
                  value={formData.occasionType}
                  onChange={(v) =>
                    setFormData({ ...formData, occasionType: v })
                  }
                  options={OCCASION_OPTIONS}
                  theme="footerCharcoal"
                  invalid={Boolean(fieldErrors.occasionType)}
                  showError={showFieldError("occasionType")}
                  errorMessage={fieldErrors.occasionType}
                />

                {submitError ? (
                  <p
                    role="alert"
                    className="text-sm font-manrope border border-[#D32C55]/40 rounded-sm px-3 py-2"
                    style={{ color: JADE_FORM_WARN }}
                  >
                    {submitError}
                  </p>
                ) : null}

                <JadeFloatingTextarea
                  id="footer-queries"
                  label="Your Queries"
                  value={formData.queries}
                  onChange={(v) =>
                    setFormData({ ...formData, queries: v })
                  }
                  theme="footerCharcoal"
                  required={false}
                  invalid={Boolean(fieldErrors.queries)}
                  showError={showFieldError("queries")}
                  errorMessage={fieldErrors.queries}
                />

                <label className="flex items-start gap-2.5 pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={showFieldError("consent")}
                    className={`mt-1 h-4 w-4 rounded-[2px] border bg-transparent text-[#EFCD62] focus:ring-[#EFCD62]/50 focus:ring-2 ${
                      showFieldError("consent")
                        ? "border-2 border-[#D32C55]"
                        : "border border-white/25"
                    }`}
                  />
                  <span className="font-manrope text-gh-label text-white/40 leading-relaxed">
                    Welcome to Jade Hospitainment, where hospitality meets
                    entertainment in unique and unforgettable ways. With over
                    two decades of experience.
                  </span>
                </label>
                {showFieldError("consent") && fieldErrors.consent ? (
                  <JadeFormFieldError
                    id="footer-consent-err"
                    message={fieldErrors.consent}
                  />
                ) : null}

                <PrimaryButton
                  type="submit"
                  width="form"
                  withArrow={false}
                  disabled={!formValid || submitting}
                  aria-disabled={!formValid || submitting}
                  className={`mt-1 ${
                    formValid && !submitting
                      ? "!bg-transparent !ring-0 border border-[#EFCD62]/40 !text-[#EFCD62] hover:!bg-[#EFCD62] hover:!text-black hover:!border-[#EFCD62]"
                      : ""
                  }`}
                >
                  {submitting ? "SENDING…" : "CONTACT US"}
                </PrimaryButton>
              </form>
            </div>

            <div className="lg:col-start-8 lg:col-span-5 flex flex-col gap-10 border-t border-white/10 pt-8 lg:gap-0 lg:border-t-0 lg:pt-0 lg:border-l lg:border-white/10 lg:px-12 xl:px-16">
              {/* LINKS — mobile/tablet: original; lg+: left-aligned with contact block below */}
              <div className="lg:flex-1 lg:flex lg:w-full lg:items-center lg:justify-start lg:pt-8 xl:pt-10">
                <div className="grid grid-cols-2 gap-x-4 sm:gap-x-10 lg:gap-x-[4.5rem] xl:gap-x-20 w-full">
                  <div className="flex flex-col gap-3 lg:gap-5 items-start">
                    {LINKS_COLUMN_1.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={footerNavLinkClass}
                      >
                        <span>{link.label}</span>
                        <span
                          aria-hidden
                          className="shrink-0 text-[0.65em] leading-none translate-y-px select-none lg:hidden"
                        >
                          ▸
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 text-[0.45em] leading-none select-none hidden lg:inline"
                        >
                          •
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 lg:gap-5 items-start">
                    {LINKS_COLUMN_2.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={footerNavLinkClass}
                      >
                        <span>{link.label}</span>
                        <span
                          aria-hidden
                          className="shrink-0 text-[0.65em] leading-none translate-y-px select-none lg:hidden"
                        >
                          ▸
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 text-[0.45em] leading-none select-none hidden lg:inline"
                        >
                          •
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info Anchor */}
              <div className="mt-auto pt-10 lg:pt-16 border-t border-white/10">
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 relative opacity-50 contrast-125">
                    <Image
                      src="/assets/Golden_Logo.png"
                      alt="Jade Logo"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-5 text-white font-manrope text-gh-label tracking-wide uppercase">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#EFCD62] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        76, phase II, Royal Enclave, Srirampura, Bengaluru - 64
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[#FAFAFA]">
                      <Phone className="w-4 h-4 text-[#EFCD62] shrink-0" />
                      <span className="hidden md:inline">0897 066 3366</span>
                      <a href="tel:08970663366" className="md:hidden hover:text-[#EFCD62] transition-colors">
                        0897 066 3366
                      </a>
                    </div>
                    <a
                      href="mailto:Info@jadehospitainment.com"
                      className="flex items-center gap-3 hover:text-[#EFCD62] transition-colors normal-case tracking-normal"
                    >
                      <Mail className="w-4 h-4 text-[#EFCD62] shrink-0" />
                      <span>Info@jadehospitainment.com</span>
                    </a>

                    <div className="flex gap-2 pt-2">
                      {[
                        {
                          Icon: Facebook,
                          size: "w-[18px] h-[18px]",
                          href: "https://www.facebook.com/jadehospitainment/",
                        },
                        {
                          Icon: Instagram,
                          size: "w-[20px] h-[20px]",
                          href: "https://www.instagram.com/jadehospitainment/?hl=en",
                        },
                        {
                          Icon: Youtube,
                          size: "w-[22px] h-[22px]",
                          href: "https://www.youtube.com/@jade_hospitainment",
                        },
                      ].map(({ Icon, size, href }, i) => (
                        <a
                          key={i}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 flex items-center justify-center bg-white/[0.03] border border-white/10 text-white/45 hover:text-[#EFCD62] hover:border-white/20 transition-all duration-300 cursor-pointer group"
                        >
                          <Icon
                            className={`${size} transition-transform group-hover:scale-110`}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM COPYRIGHT BAR ─────────────────────────────────────── */}
          <div className="border-t border-white/10 mt-11 pt-6 flex w-full justify-center">
            <p className="font-manrope text-gh-label text-white/35 tracking-widest uppercase text-center">
              © Copyright {currentYear} Jade Hospitainment – All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccess(false)}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />

            {/* Centering wrapper */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-4">
              {/* Relative wrapper so close button can float above */}
              <div className="relative pointer-events-auto w-full max-w-[520px]">
                {/* Close button — floats centered above the card */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="w-12 h-12 rounded-full bg-[#124131] flex items-center justify-center text-white hover:bg-[#1f5c48] transition-colors shadow-2xl"
                  >
                    <X className="w-6 h-6 stroke-[1.5]" />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-h-[85vh] bg-[#0B2C23] rounded-3xl flex flex-col shadow-2xl border border-white/10 overflow-hidden"
                >
                  <div className="flex flex-col items-center justify-center px-8 text-center pt-6 pb-8 overflow-y-auto" data-lenis-prevent>
                    {/* Glassy circular wrapper for the checkmark */}
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-[160px] h-[160px] shrink-0 relative mb-6 rounded-full flex items-center justify-center"
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "rgba(255, 255, 255, 0.10)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(255, 255, 255, 0.18)",
                          boxShadow:
                            "inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 24px rgba(0,0,0,0.15)",
                        }}
                      />
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: 6,
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <div className="w-[84px] h-[84px] shrink-0 relative drop-shadow-2xl">
                        <Image
                          src="/assets/JAde Correction.png"
                          alt="Success Check"
                          fill
                          sizes="96px"
                          quality={100}
                          className="object-contain"
                        />
                      </div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-white text-gh-h2 font-philosopher mb-3"
                    >
                      We've got it from here
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 text-gh-body leading-relaxed mb-8 max-w-sm mx-auto font-manrope"
                    >
                      Thanks for sharing your details!
                      <br />
                      Our team will take a look and reach out shortly to
                      understand things better.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col w-full max-w-[280px] mx-auto gap-4"
                    >
                      <p className="text-white/50 text-gh-label font-bold tracking-[0.2em] uppercase text-center">
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
                            className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/20 hover:bg-[#EFCD62] hover:border-[#EFCD62] transition-colors group"
                          >
                            <Icon className="w-5 h-5 text-white/50 group-hover:text-black transition-colors" />
                          </a>
                        ))}
                      </div>

                      <p className="text-white/30 text-gh-label italic text-center">
                        Thoughtfully operated. Always.
                      </p>

                      <PrimaryButton
                        withArrow={false}
                        width="form"
                        onClick={handleFooterSuccessOkay}
                      >
                        OKAY
                      </PrimaryButton>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
