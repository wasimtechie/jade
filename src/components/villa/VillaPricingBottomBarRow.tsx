"use client";

import clsx from "clsx";
import PrimaryButton from "@/components/PrimaryButton";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type VillaPricingBottomBarRowProps = {
  priceDisplay: string;
  priceLabel?: string;
  onEnquireClick: () => void;
  bookHref?: string;
  showBook?: boolean;
  className?: string;
};

/** Shared price + ENQUIRE + BOOK row for villa detail and Know More overlays. */
export default function VillaPricingBottomBarRow({
  priceDisplay,
  priceLabel = "Starting from",
  onEnquireClick,
  bookHref,
  showBook = true,
  className,
}: VillaPricingBottomBarRowProps) {
  return (
    <div className={clsx(vd.contentInsetShell, vd.pricingBarRow, className)}>
      <div className={vd.pricingBarPriceCol}>
        <span className={vd.pricingBarLabel}>{priceLabel}</span>
        <span className={vd.pricingBarPrice}>{priceDisplay}</span>
      </div>
      <div className={vd.pricingBarActions}>
        <button type="button" onClick={onEnquireClick} className={vd.pricingBarEnquire}>
          ENQUIRE
        </button>
        {showBook && bookHref ? (
          <PrimaryButton
            href={bookHref}
            withArrow={false}
            width="compact"
            size="chrome"
            className={vd.pricingBarBookCta}
          >
            BOOK VILLA
          </PrimaryButton>
        ) : null}
      </div>
    </div>
  );
}
