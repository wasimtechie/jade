"use client";

import Link from "next/link";
import { VILLA_DETAIL_SPACING } from "@/components/villa/villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type Props = {
  onClosePrivacyNav?: () => void;
};

/** Shared privacy / terms footnote for venue overlay enquiry forms. */
export default function VenueEnquiryLegalFootnote({ onClosePrivacyNav }: Props) {
  return (
    <p className={vd.formLegalFootnote}>
      By proceeding, you agree to our{" "}
      <Link
        href="/privacy-policy"
        className="text-[#EFCD62] hover:underline"
        onClick={onClosePrivacyNav}
      >
        Privacy Policy
      </Link>
      ,{" "}
      <Link
        href="/terms-conditions"
        className="text-[#EFCD62] hover:underline"
        onClick={onClosePrivacyNav}
      >
        Terms & Conditions
      </Link>{" "}
      and{" "}
      <Link
        href="/refund-policy"
        className="text-[#EFCD62] hover:underline"
        onClick={onClosePrivacyNav}
      >
        Refund Policy
      </Link>
    </p>
  );
}
