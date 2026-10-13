import type { CmsLandingSection } from "@/lib/cms/landingCms";

type LandingRichSectionProps = {
  section: CmsLandingSection;
};

export function LandingRichSection({ section }: LandingRichSectionProps) {
  const heading = section.heading?.trim();
  const body = section.body?.trim();
  if (!heading && !body) return null;

  return (
    <section className="px-6 md:px-12 lg:px-24 py-12 md:py-16 border-t border-white/10 bg-[#1A1C1E]">
      <div className="max-w-3xl mx-auto space-y-4">
        {heading && (
          <h2 className="font-philosopher text-gh-h2 text-white border-b border-white/10 pb-3">
            {heading}
          </h2>
        )}
        {body && (
          <div className="font-manrope text-gh-body text-white/75 leading-relaxed whitespace-pre-line">
            {body}
          </div>
        )}
        {section.image?.trim() && (
          <img
            src={section.image}
            alt={heading || "Section image"}
            className="mt-6 w-full border border-white/10 object-cover"
          />
        )}
      </div>
    </section>
  );
}
