"use client";

import PrimaryButton from "@/components/PrimaryButton";
import clsx from "clsx";
import type { VillaActivity } from "@/lib/types";
import VillaDetailImageFrame from "./VillaDetailImageFrame";
import VillaDetailCarouselControls from "./VillaDetailCarouselControls";
import { VILLA_DETAIL_SPACING } from "./villaDetailSpacing";
import { EXPERIENCE_SECTION_CTA_CONTAINER_CLASS } from "@/lib/experienceSectionCta";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  activity: VillaActivity;
  slideCount: number;
  activityIndex: number;
  fallbackImage: string;
  onPrev: () => void;
  onNext: () => void;
  onPauseAuto?: () => void;
  onResumeAuto?: () => void;
  onEnquire: () => void;
  isValidImage: (url?: string) => boolean;
};

export default function VillaDetailExperienceCarousel({
  activity,
  slideCount,
  activityIndex,
  fallbackImage,
  onPrev,
  onNext,
  onPauseAuto,
  onResumeAuto,
  onEnquire,
  isValidImage,
}: Props) {
  const src = isValidImage(activity.image) ? activity.image : fallbackImage;

  return (
    <div className={vd.mediaSectionStack}>
      <h3 className={vd.sectionHeading}>Experiences</h3>
      {src ? (
        <VillaDetailImageFrame
          imageKey={`${activityIndex}-${src}`}
          src={src}
          alt={activity.title}
          onPrev={onPrev}
          onNext={onNext}
          slideCount={slideCount}
          onPauseAuto={onPauseAuto}
          onResumeAuto={onResumeAuto}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-jade-charcoal/80 via-transparent to-transparent opacity-90 z-[5] pointer-events-none" />
          <VillaDetailCarouselControls
            label={activity.title}
            slideCount={slideCount}
            onPrev={onPrev}
            onNext={onNext}
          />
          {activity.description ? (
            <div className="absolute bottom-24 sm:bottom-28 left-0 right-0 z-[15] px-6 md:px-12 pointer-events-none">
              <p
                className={clsx(
                  vd.mediaDescription,
                  "max-w-2xl mx-auto text-center line-clamp-2",
                )}
              >
                {activity.description}
              </p>
            </div>
          ) : null}
        </VillaDetailImageFrame>
      ) : null}
      <div className={EXPERIENCE_SECTION_CTA_CONTAINER_CLASS}>
        <PrimaryButton
          width="section"
          withArrow={false}
          onClick={onEnquire}
        >
          ENQUIRE
        </PrimaryButton>
      </div>
    </div>
  );
}
