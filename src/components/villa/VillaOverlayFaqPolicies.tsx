"use client";

import clsx from "clsx";
import { ExperiencePolicyCompactList } from "@/components/experience/ExperienceFaqAccordion";
import VillaDetailFaqList from "./VillaDetailFaqList";
import {
  VILLA_DETAIL_CHARCOAL,
  VILLA_DETAIL_SPACING,
} from "./villaDetailSpacing";

const vd = VILLA_DETAIL_SPACING;

type Policy = { title: string; desc: string };
type FaqItem = { question: string; answer: string };

type Props = {
  faqItems: FaqItem[];
  policies: Policy[];
};

/** FAQ + Key Policies as two villa-detail sections (each with sectionShell padding). */
export default function VillaOverlayFaqPolicies({ faqItems, policies }: Props) {
  return (
    <>
      <section id="faq" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.heading}>FAQ</h3>
            {faqItems.length > 0 ? (
              <VillaDetailFaqList items={faqItems} expandInPlace />
            ) : null}
          </div>
        </div>
      </section>

      <section id="key-policies" className={VILLA_DETAIL_CHARCOAL}>
        <div className={vd.sectionShell}>
          <div className={clsx(vd.content, vd.stack)}>
            <h3 className={vd.heading}>Key Policies</h3>
            <ExperiencePolicyCompactList policies={policies} />
          </div>
        </div>
      </section>
    </>
  );
}
