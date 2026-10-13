"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PrimaryButton from "@/components/PrimaryButton";
import FormOverlayLayout from "@/components/overlays/FormOverlayLayout";
import OverlayEnquirySuccessContent from "@/components/overlays/OverlayEnquirySuccessContent";
import LiveBackground from "@/components/LiveBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionFillTransition from "@/components/ui/SectionFillTransition";
import GoldAccentLine from "@/components/ui/GoldAccentLine";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  validateCareerResumeFile,
  validateCareerResumeRequired,
} from "@/lib/careerResumeValidation";
import CareersApplyFormFields from "@/components/careers/CareersApplyFormFields";
import { isCareersApplyFormValid } from "@/lib/leadFormValidation";
import { formatSubmitError } from "@/lib/submitErrorMessage";
import {
  buildCareersApplyContext,
  type CareersApplyEntryPoint,
} from "@/lib/careersApplyContext";
import {
  CAREERS_JOBS,
  OPEN_APPLICATION_JOB_ID,
  resolveCareerJobTitle,
} from "@/data/careersJobs";
import { resolveEnquiryOkayReturnPath } from "@/lib/enquiryReturnPath";

export default function CareersPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [applyJobId, setApplyJobId] = useState(OPEN_APPLICATION_JOB_ID);
  const [applyEntryPoint, setApplyEntryPoint] =
    useState<CareersApplyEntryPoint>("send-cv");
  const [apFullName, setApFullName] = useState("");
  const [apEmail, setApEmail] = useState("");
  const [apPhone, setApPhone] = useState("");
  const [apCompany, setApCompany] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const resumeInputMobileRef = useRef<HTMLInputElement>(null);
  const resumeInputDesktopRef = useRef<HTMLInputElement>(null);

  const [canClose, setCanClose] = useState(false);

  const resetApplicationForm = () => {
    setApFullName("");
    setApEmail("");
    setApPhone("");
    setApCompany("");
    setResumeFile(null);
    setSelectedFileName(null);
    setResumeError(null);
    setApplyError(null);
    setApplySubmitting(false);
    setIsSuccess(false);
    if (resumeInputMobileRef.current) resumeInputMobileRef.current.value = "";
    if (resumeInputDesktopRef.current) resumeInputDesktopRef.current.value = "";
  };

  const clearResume = () => {
    setResumeFile(null);
    setSelectedFileName(null);
    setResumeError(null);
    if (resumeInputMobileRef.current) resumeInputMobileRef.current.value = "";
    if (resumeInputDesktopRef.current) resumeInputDesktopRef.current.value = "";
  };

  const closeApplyModal = () => {
    resetApplicationForm();
    setIsApplyModalOpen(false);
    setIsSuccess(false);
  };

  /** Form backdrop / X — closes overlay and stays on Careers (success or form). */
  const handleApplyModalDismiss = () => {
    if (!canClose) return;
    closeApplyModal();
  };

  const handleApplySuccessOkay = () => {
    const returnPath = resolveEnquiryOkayReturnPath();
    closeApplyModal();
    router.push(returnPath);
  };

  useEffect(() => {
    if (isApplyModalOpen) {
      setCanClose(false);
      const timer = setTimeout(() => setCanClose(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isApplyModalOpen]);

  /* Body scroll lock — prevents background scroll + viewport shift on mobile */
  useEffect(() => {
    document.body.style.overflow = isApplyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isApplyModalOpen]);

  const toggleJob = (id: string) => {
    setExpandedJob(expandedJob === id ? null : id);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    const resumeErr = validateCareerResumeRequired(resumeFile);
    if (resumeErr) setResumeError(resumeErr);

    if (
      !isCareersApplyFormValid(
        { fullName: apFullName, email: apEmail, phone: apPhone },
        resumeErr,
        resumeFile,
      )
    ) {
      return;
    }

    const applyContext = buildCareersApplyContext({
      jobId: applyJobId,
      clientPath: pathname ?? "/careers",
      entryPoint: applyEntryPoint,
    });

    setApplySubmitting(true);
    setApplyError(null);
    try {
      const fd = new FormData();
      fd.append("jobId", applyContext.jobId);
      fd.append("jobTitle", applyContext.jobTitle);
      fd.append("sourcePage", applyContext.sourcePage);
      fd.append("applyContext", applyContext.applyContext);
      fd.append("clientPath", applyContext.clientPath);
      fd.append("fullName", apFullName.trim());
      fd.append("email", apEmail.trim());
      fd.append("phone", apPhone.trim());
      fd.append("company", apCompany.trim());
      fd.append("resume", resumeFile!);

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Unable to submit application.");
      }
      setIsSuccess(true);
    } catch (err) {
      setApplyError(
        formatSubmitError(err, "Unable to submit application."),
      );
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateCareerResumeFile(f);
    setResumeError(err);
    if (err) {
      setResumeFile(null);
      setSelectedFileName(null);
      return;
    }
    setResumeFile(f);
    setSelectedFileName(f.name);
  };

  return (
    <main className="relative min-h-screen bg-[#1A1C1E] text-white pb-16 lg:pb-0">
      {/* ── Navigation ── */}
      <Navbar />
      <MobileBottomNav />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <GoldAccentLine className="absolute top-0 left-0 right-0 z-20" />
        {/* Live Background */}
        <div className="absolute inset-0 z-0 opacity-80">
          <LiveBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#EFCD62] text-gh-label font-bold tracking-[0.3em] uppercase mb-5"
          >
            CAREERS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gh-h1 font-philosopher leading-tight mb-6"
          >
            Work Where <br /> Standards Matter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-gh-body max-w-2xl mx-auto mb-10 font-manrope leading-relaxed"
          >
            Join us in building Hospitainment, bringing together hospitality,
            events and operations with clarity and care.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() =>
              document
                .getElementById("jobs")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-widest text-gh-label px-12 py-4 rounded-none transition-all"
          >
            VIEW OPEN ROLES
          </motion.button>
        </div>
        <GoldAccentLine className="absolute bottom-0 left-0 right-0 z-20" />
      </section>

      <GoldAccentLine />

      {/* 2. JOBS SECTION */}
      <section
        id="jobs"
        className="jade-section bg-[#0B2C23] relative"
      >
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-3">
              JOBS
            </p>
            <h2 className="text-gh-h2 font-philosopher text-white">
              Current Opportunities
            </h2>
          </div>

          <div className="space-y-1">
            {CAREERS_JOBS.map((job) => (
              <div key={job.id} className="border-b border-white/10">
                <button
                  onClick={() => toggleJob(job.id)}
                  className="w-full py-6 flex items-center justify-between text-left group hover:opacity-80 transition-opacity"
                >
                  <span className="text-gh-label font-bold tracking-widest uppercase">
                    {job.title}
                  </span>
                  {expandedJob === job.id ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedJob === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 text-white/80 font-manrope space-y-6">
                        <div>
                          <p className="leading-relaxed text-gh-body mb-5 text-justify">
                            {job.purpose}
                          </p>
                          <p className="leading-relaxed text-gh-body italic text-justify">
                            If you&apos;re someone who&apos;s constantly on
                            Social Media, knows what&apos;s trending, and enjoys
                            making videos, reels, or content that gets attention
                            this internship is the perfect creative playground
                            for you.
                          </p>
                        </div>

                        {job.purposeToTeam && (
                          <div>
                            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-gh-label">
                              Your Purpose to the Team:
                            </h4>
                            <ul className="list-disc pl-5 space-y-2 text-gh-desc">
                              {job.purposeToTeam.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-gh-label">
                            What We&apos;re Looking For:
                          </h4>
                          <ul className="list-disc pl-5 space-y-2 text-gh-desc">
                            {job.lookingFor.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <PrimaryButton
                          width="form"
                          withArrow={false}
                          className="mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            resetApplicationForm();
                            setApplyJobId(job.id);
                            setApplyEntryPoint("job-card");
                            setIsApplyModalOpen(true);
                          }}
                        >
                          APPLY NOW
                        </PrimaryButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionFillTransition from="green" to="deep" />
      {/* 3. CULTURE SECTION (Optimized for 100vh) */}
      <section className="jade-section relative min-h-[100svh] flex flex-col justify-center bg-[#1A1C1E] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 w-full">
          <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-3">
            CULTURE
          </p>
          <h2 className="text-gh-h1 font-philosopher text-white mb-6">
            Work Hard. <br /> Celebrate Well.
          </h2>

          <div className="text-white/70 max-w-2xl mx-auto space-y-5 font-manrope leading-relaxed mb-10 text-gh-body">
            <p className="text-center">
              Our culture is built on accountability, teamwork, and consistent
              execution. We take our work seriously, knowing that experience is
              shaped by effort. And when we succeed, we celebrate it with the
              same energy we bring to the job.
            </p>
            <p className="text-white/40 italic text-center">
              Bringing unique VILLAS and curated experiences together under one
              standard of hospitality.
            </p>
          </div>

          <div className="w-full mx-auto flex justify-center">
            <PrimaryButton
              width="auto"
              withArrow={false}
              className="px-8"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                resetApplicationForm();
                setApplyJobId(OPEN_APPLICATION_JOB_ID);
                setApplyEntryPoint("send-cv");
                setIsApplyModalOpen(true);
              }}
            >
              SEND US YOUR CV
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* 4. APPLICATION MODAL / FULL-SCREEN MOBILE OVERLAY */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <>
            {/* ── Desktop backdrop (md+) ── */}
            <div className="hidden md:block">
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleApplyModalDismiss}
                className={`fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm ${!canClose || isSuccess ? "pointer-events-none" : ""}`}
              />
            </div>

            {/* ── Mobile: Know More form shell (8vh band + 92vh sheet) ── */}
            <div className="md:hidden">
              <FormOverlayLayout
                onClose={handleApplyModalDismiss}
                canDismiss={canClose}
                showSheetTopEdgeShade={!isSuccess}
                sheetFrameClassName="bg-[#0B2C23]"
                scrollClassName={
                  isSuccess ? "px-0 font-manrope" : "font-manrope"
                }
              >
                  {!isSuccess ? (
                    /* FORM VIEW */
                    <div className="px-5 pt-4 pb-8 w-full box-border">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-gh-h3 font-philosopher text-white mt-2">
                          Apply Now
                        </h3>
                      </div>
                      <p className="text-[#EFCD62]/80 text-gh-label font-bold tracking-widest uppercase mb-2">
                        {resolveCareerJobTitle(applyJobId)}
                      </p>
                      <p className="text-white/60 text-gh-desc mb-6 leading-relaxed">
                        Share a few details. Our team will get back to you
                        shortly
                      </p>

                      <CareersApplyFormFields
                        idPrefix="apply-mobile"
                        fullName={apFullName}
                        email={apEmail}
                        phone={apPhone}
                        company={apCompany}
                        onFullNameChange={setApFullName}
                        onEmailChange={setApEmail}
                        onPhoneChange={setApPhone}
                        onCompanyChange={setApCompany}
                        selectedFileName={selectedFileName}
                        resumeFile={resumeFile}
                        resumeError={resumeError}
                        resumeInputRef={resumeInputMobileRef}
                        onResumeChange={handleFileChange}
                        onResumeClear={clearResume}
                        applyError={applyError}
                        submitting={applySubmitting}
                        onSubmit={handleApply}
                      />
                    </div>
                  ) : (
                    <OverlayEnquirySuccessContent
                      embedded
                      onOkay={handleApplySuccessOkay}
                    />
                  )}
              </FormOverlayLayout>
            </div>

            {/* ── Desktop: centered modal (md+) ── */}
            <div className="hidden md:flex fixed inset-0 z-[101] items-center justify-center pointer-events-none">
              <motion.div
                key="modal-desktop"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full max-w-lg bg-[#0B2C23] overflow-visible max-h-[85vh] rounded-3xl shadow-2xl pointer-events-auto flex flex-col"
              >
                {/* The Close button centered at top, outside the modal */}
                <div className="absolute -top-[72px] left-1/2 -translate-x-1/2 flex items-center z-10">
                  <button
                    type="button"
                    onClick={handleApplyModalDismiss}
                    disabled={!canClose}
                    aria-disabled={!canClose}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors shadow-2xl ${
                      !canClose
                        ? "bg-[#124131]/40 cursor-not-allowed opacity-50"
                        : "bg-[#124131] hover:bg-[#1f5c48]"
                    }`}
                  >
                    <X className="w-6 h-6 stroke-[1.5]" />
                  </button>
                </div>

                <div
                  className={`overflow-y-auto overflow-x-hidden rounded-3xl ${isSuccess ? "p-0" : "p-12"}`}
                  data-lenis-prevent
                >
                  {!isSuccess ? (
                    <>
                      <h3 className="text-gh-h1 font-philosopher text-white mb-3 pr-16">
                        Apply Now
                      </h3>
                      <p className="text-[#EFCD62]/80 text-gh-label font-bold tracking-widest uppercase mb-2">
                        {resolveCareerJobTitle(applyJobId)}
                      </p>
                      <p className="text-white/60 text-gh-desc mb-8">
                        Share a few details. Our team will get back to you
                        shortly
                      </p>

                      <CareersApplyFormFields
                        idPrefix="apply-desktop"
                        fullName={apFullName}
                        email={apEmail}
                        phone={apPhone}
                        company={apCompany}
                        onFullNameChange={setApFullName}
                        onEmailChange={setApEmail}
                        onPhoneChange={setApPhone}
                        onCompanyChange={setApCompany}
                        selectedFileName={selectedFileName}
                        resumeFile={resumeFile}
                        resumeError={resumeError}
                        resumeInputRef={resumeInputDesktopRef}
                        onResumeChange={handleFileChange}
                        onResumeClear={clearResume}
                        applyError={applyError}
                        submitting={applySubmitting}
                        onSubmit={handleApply}
                      />
                    </>
                  ) : (
                    <OverlayEnquirySuccessContent
                      embedded
                      onOkay={handleApplySuccessOkay}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
