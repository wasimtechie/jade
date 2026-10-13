"use client";

import dynamic from "next/dynamic";
import { useAnimation } from "@/context/AnimationContext";
import { EXPERIENCE_PAGE_PATHS } from "@/lib/enquiryReturnPath";
import type { CmsLandingSection } from "@/lib/cms/landingCms";
import { CmsExperienceHero } from "@/components/landing/CmsExperienceHero";
import { CmsExperiencesHubHero } from "@/components/landing/CmsExperiencesHubHero";
import WeddingHero from "@/components/WeddingHero";
import { LandingRichSection } from "@/components/landing/LandingRichSection";
import MeanderStrip from "@/components/ui/MeanderStrip";
import SectionFillTransition from "@/components/ui/SectionFillTransition";
import TrustedBySection from "@/components/TrustedBySection";
import FormatsCarousel from "@/components/FormatsCarousel";
import CorporateVillasCarousel from "@/components/CorporateVillasCarousel";
import PremiumFeaturesSection from "@/components/PremiumFeaturesSection";
import ExperienceScrollSection from "@/components/ExperienceScrollSection";
import ExperienceCarouselSection from "@/components/ExperienceCarouselSection";
import CuratedExperiencesGrid from "@/components/CuratedExperiencesGrid";
import WeekendThemedVillasSection from "@/components/weekend/WeekendThemedVillasSection";
import PartyVillasCarousel from "@/components/PartyVillasCarousel";

const WeddingScrollSection = dynamic(
  () => import("@/components/WeddingScrollSection"),
  { ssr: false },
);
const WeddingVillasCarousel = dynamic(
  () => import("@/components/WeddingVillasCarousel"),
  { ssr: false },
);
const WeddingServicesSection = dynamic(
  () => import("@/components/WeddingServicesSection"),
  { ssr: false },
);
const WhyJadeWeddings = dynamic(() => import("@/components/WhyJadeWeddings"), {
  ssr: false,
});
const WeddingCelebrationsSection = dynamic(
  () => import("@/components/WeddingCelebrationsSection"),
  { ssr: false },
);
const ExperiencesScrollSection = dynamic(
  () => import("@/components/ExperiencesScrollSection"),
  { ssr: false },
);

const weekendSlides = [
  {
    title: "Poolside Mornings",
    desc: "Slow mornings by the pool with coffee, sunlight, and nowhere else to be.",
    image:
      "/Experiences/Weekend Getaways/2-What Weekends Look like/Poolside Mornings.webp",
  },
  {
    title: "Evenings Under the Stars",
    desc: "Bonfires, music, and long conversations that stretch late into the night.",
    image:
      "/Experiences/Weekend Getaways/2-What Weekends Look like/Evenings Under the Stars.webp",
  },
  {
    title: "Outdoor Dining",
    desc: "Freshly grilled meals, laughter around the table, and food shared with friends.",
    image:
      "/Experiences/Weekend Getaways/2-What Weekends Look like/Outdoor dining.webp",
  },
  {
    title: "Nature & Nearby Escapes",
    desc: "Morning treks, quiet lakes, and scenic walks just minutes from your villa.",
    image:
      "/Experiences/Weekend Getaways/2-What Weekends Look like/Nature & Nearby Escapes.webp",
  },
];

const weekendExperiences = [
  {
    title: "Bonfire Nights",
    image: "/Experiences/Weekend Getaways/3-Addons/Bonfire Nights.webp",
  },
  {
    title: "BBQ Evenings",
    image: "/Experiences/Weekend Getaways/3-Addons/BBQ Evenings.webp",
  },
  {
    title: "Movie Under the Stars",
    image:
      "/Experiences/Weekend Getaways/3-Addons/Movie Under The Stars-2.webp",
  },
  {
    title: "Candlelight Dinner",
    image: "/Experiences/Weekend Getaways/3-Addons/Candlelight Dinner.webp",
  },
  {
    title: "Outdoor Games",
    image: "/Experiences/Weekend Getaways/3-Addons/outdoor games.webp",
  },
  {
    title: "Live Music / DJ",
    image: "/Experiences/Weekend Getaways/3-Addons/Live Music _ DJ.webp",
  },
  {
    title: "Private Chef Experience",
    image:
      "/Experiences/Weekend Getaways/3-Addons/Private Chef Experience.webp",
  },
];

const partySlides = [
  {
    title: "Pool Parties",
    desc: "Celebrate poolside with loungers, BBQ setups, cocktail stations, and vibrant lighting.",
    image: "/Experiences/Party Villas/2-Party Type/Pool Parties.webp",
  },
  {
    title: "Bachelor/Bachelorette Parties",
    desc: "Private villas designed for pre-wedding celebrations with music, entertainment, and curated dining.",
    image:
      "/Experiences/Party Villas/2-Party Type/Bachelor_Bachelorette Parties.webp",
  },
  {
    title: "Reunions & Graduation Parties",
    desc: "Spacious villas perfect for reconnecting, celebrating milestones, and hosting memorable gatherings.",
    image:
      "/Experiences/Party Villas/2-Party Type/Reunions & Graduation Parties.webp",
  },
  {
    title: "Birthdays & Anniversaries",
    desc: "Host memorable celebrations in beautifully curated villas with décor, dining, music, and private pools.",
    image:
      "/Experiences/Party Villas/2-Party Type/Birthdays & Anniversaries.webp",
  },
];

function WeekendFeaturesSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <PremiumFeaturesSection
      subheading="WHY CHOOSE JADE"
      heading="Designed for Private Weekend Escapes"
      cardsLayout="scroll"
      cards={[
        {
          tag: "provide",
          title: "Private Villas",
          desc: "Stay in fully Private Villas designed for relaxed getaways, with no shared spaces and complete freedom to enjoy your time.",
        },
        {
          tag: "create",
          title: "ROOM TO UNWIND",
          desc: "Spacious lawns, private pools, and open settings that make it easy to slow down and enjoy the weekend.",
        },
        {
          tag: "customise",
          title: "YOUR EXPERIENCE",
          desc: "Add bonfires, BBQ nights, movie screenings, or curated dining experiences to make your getaway truly memorable.",
        },
        {
          tag: "host",
          title: "SEAMLESS STAYS",
          desc: "From check-in to curated experiences, our team ensures your weekend getaway is effortless and well taken care of.",
        },
      ]}
      footerText="Private Villas and curated experiences designed to make every weekend feel like an escape."
      ctaText="PLAN YOUR WEEKEND ESCAPE"
      onCtaClick={() =>
        setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.weekendGetaways)
      }
      alternateGold={true}
      experienceCta
    />
  );
}

function PartyFeaturesSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <div id="spaces-for-celebrations">
      <PremiumFeaturesSection
        subheading="WHY CELEBRATE AT JADE"
        heading="Spaces Made for Celebrations"
        cardsLayout="scroll"
        cards={[
          {
            tag: "enjoy",
            title: "PRIVATE PARTY VILLAS",
            desc: "Exclusive villas with private pools and spacious outdoor areas designed for unforgettable celebrations.",
          },
          {
            tag: "customize",
            title: "YOUR CELEBRATION",
            desc: "Tailor décor, dining, music, and experiences to match your celebration.",
          },
          {
            tag: "experience",
            title: "SEAMLESS SERVICE",
            desc: "Our team handles planning, setup, and coordination so you can focus on celebrating.",
          },
          {
            tag: "enjoy",
            title: "LUXURY AMENITIES",
            desc: "Private pools, entertainment zones, music systems, BBQ setups, and spacious lounges.",
          },
        ]}
        footerText="Private villas and curated experiences designed to make every celebration a masterpiece."
        ctaText="PLAN YOUR CELEBRATION"
        onCtaClick={() =>
          setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.partyVillas)
        }
        alternateGold={true}
        experienceCta
      />
    </div>
  );
}

function CorporateFeaturesSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <PremiumFeaturesSection
      subheading="WHY CORPORATES CHOOSE JADE"
      heading={
        <>
          Designed for Structured
          <br />
          Corporate Retreats
        </>
      }
      cardsLayout="scroll"
      cards={[
        {
          tag: "provide",
          title: "COMPLETE PRIVACY",
          desc: "Exclusive-use venues with no shared spaces, ensuring uninterrupted sessions and confidential discussions.",
        },
        {
          tag: "enable",
          title: "STRUCTURED PRODUCTIVITY",
          desc: "Flexible indoor and outdoor layouts suited for meetings, workshops, conferences, and recognition programmes.",
        },
        {
          tag: "customise",
          title: "AROUND YOUR TEAM",
          desc: "Tailored meals and curated team-building activities aligned with your retreat goals and schedule.",
        },
        {
          tag: "manage",
          title: "END-TO-END EXECUTION",
          desc: "Clear planning and on-ground coordination to ensure every offsite runs smoothly from start to finish.",
        },
      ]}
      footerText='"Structured spaces and curated experiences brought together under one standard of corporate hospitality."'
      ctaText="SPEAK WITH OUR TEAM"
      onCtaClick={() =>
        setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.corporateRetreats)
      }
      alternateGold={true}
      experienceCta
    />
  );
}

function WeekendCarouselSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <ExperienceCarouselSection
      label="WHAT WEEKENDS AT JADE LOOK LIKE"
      title="Jade Weekends"
      slides={weekendSlides}
      ctaText="BOOK JADE WEEKEND"
      onCtaClick={() =>
        setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.weekendGetaways)
      }
    />
  );
}

function WeekendExperiencesSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <CuratedExperiencesGrid
      label="CURATED EXPERIENCES"
      title="Enhance Your Stay"
      experiences={weekendExperiences}
      showCta={false}
      ctaText="VIEW ALL EXPERIENCES"
      onCtaClick={() =>
        setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.weekendGetaways)
      }
      innerClassName="max-w-6xl mx-auto px-4 sm:px-6 md:px-8"
    />
  );
}

function PartyCarouselSection() {
  const { setEnquireOverlayOpen } = useAnimation();
  return (
    <ExperienceCarouselSection
      label="WHAT WE OFFER"
      title="Party Types"
      slides={partySlides}
      ctaText="BOOK A PARTY VILLA"
      onCtaClick={() =>
        setEnquireOverlayOpen(true, EXPERIENCE_PAGE_PATHS.partyVillas)
      }
    />
  );
}

function PartyExperiencesSection() {
  return (
    <CuratedExperiencesGrid
      label="PERSONALIZE YOUR CELEBRATION"
      title="Curated Experiences"
      showCta={false}
      innerClassName="max-w-6xl mx-auto px-4 sm:px-6 md:px-8"
      experiences={[
        {
          title: "DJ & Music Setup",
          image: "/Experiences/Party Villas/3-Addons/DJ & Music Setup.webp",
        },
        {
          title: "BBQ & Live Grills",
          image: "/Experiences/Party Villas/3-Addons/BBQ & Live Grills.webp",
        },
        {
          title: "Cocktail Bar Setup",
          image: "/Experiences/Party Villas/3-Addons/Cocktail Bar Setup.webp",
        },
        {
          title: "Bonfire Nights",
          image: "/Experiences/Party Villas/3-Addons/Bonfire Nights.webp",
        },
        {
          title: "Movie Under the Stars",
          image:
            "/Experiences/Party Villas/3-Addons/Movie Under The Stars-2.webp",
        },
        {
          title: "Themed Decor & Styling",
          image:
            "/Experiences/Party Villas/3-Addons/Themed Decor and Styling.webp",
        },
      ]}
    />
  );
}

function renderWeddingsSlot(section: CmsLandingSection) {
  const base = section.slotId.replace(/-copy-\d+$/, "");
  switch (base) {
    case "hero":
      return (
        <WeddingHero
          cms={{
            heading: section.heading,
            description: section.body,
            backgroundImage: section.image,
          }}
        />
      );
    case "philosophy":
      return <WeddingScrollSection id="wedding-philosophy" />;
    case "villas":
      return <WeddingVillasCarousel />;
    case "meander-1":
      return <MeanderStrip accentLine="green" />;
    case "services":
      return <WeddingServicesSection />;
    case "why-jade":
      return <WhyJadeWeddings />;
    case "meander-2":
      return <MeanderStrip track="green" />;
    case "celebrations":
      return <WeddingCelebrationsSection />;
    default:
      return null;
  }
}

function renderCorporateSlot(section: CmsLandingSection) {
  const base = section.slotId.replace(/-copy-\d+$/, "");
  switch (base) {
    case "hero":
      return (
        <CmsExperienceHero
          cms={{
            heading: section.heading,
            description: section.body,
            backgroundImage: section.image,
          }}
          videoSlug="corporate"
          scrollTargetId="corporate-philosophy"
          backgroundAlt="Corporate Retreats"
          defaultHeading="Corporate Offsites\nat Jade"
          defaultDescription="Private venues designed for focused sessions, team alignment, and meaningful downtime."
          defaultImage="/Experiences/Corporate Retreats/1-Hero/xhero.webp"
          villaScrollKey="corporate"
          stats={[
            { value: "16", label: "LUXURY VILLA" },
            { value: "7500+", label: "CHECK-INS" },
            { value: "100+", label: "EVENTS HOSTED" },
          ]}
        />
      );
    case "trusted-by":
      return <TrustedBySection />;
    case "philosophy":
      return (
        <section className="jade-section bg-[#1A1C1E] border-t border-white/5">
          <ExperienceScrollSection variant="corporate" id="corporate-philosophy" />
        </section>
      );
    case "formats":
      return (
        <section className="flex flex-col h-[85dvh] min-h-[85dvh] max-h-[85dvh] overflow-hidden bg-[#1A1C1E] border-t border-white/5 lg:h-[100dvh] lg:min-h-[100dvh] lg:max-h-[100dvh]">
          <FormatsCarousel />
        </section>
      );
    case "features":
      return <CorporateFeaturesSection />;
    case "villas":
      return (
        <section className="jade-section bg-[#1A1C1E] border-t border-white/5">
          <div className="text-center mb-12 px-8">
            <p className="text-[#EFCD62] text-gh-label font-bold tracking-[0.2em] uppercase mb-3 font-manrope">
              FEATURED VENUES
            </p>
            <h2 className="text-gh-h1 font-philosopher text-white mb-6 lg:whitespace-nowrap">
              Explore Our Private
              <br className="lg:hidden" />
              Corporate Retreats
            </h2>
          </div>
          <CorporateVillasCarousel />
        </section>
      );
    default:
      return null;
  }
}

function renderWeekendSlot(section: CmsLandingSection) {
  const base = section.slotId.replace(/-copy-\d+$/, "");
  switch (base) {
    case "hero":
      return (
        <CmsExperienceHero
          cms={{
            heading: section.heading,
            description: section.body,
            backgroundImage: section.image,
          }}
          videoSlug="getaways"
          scrollTargetId="weekend-philosophy"
          backgroundAlt="Weekend Getaways"
          defaultHeading="Weekend Getaways\nIn Bangalore"
          defaultDescription="Private Villas designed for relaxed escapes, small celebrations, and memorable weekends with friends and family."
          defaultImage="/Experiences/Weekend Getaways/1-Hero/casual stays.webp"
          villaScrollKey="weekend"
        />
      );
    case "philosophy":
      return (
        <ExperienceScrollSection variant="weekend" id="weekend-philosophy" />
      );
    case "carousel":
      return <WeekendCarouselSection />;
    case "experiences":
      return <WeekendExperiencesSection />;
    case "features":
      return <WeekendFeaturesSection />;
    case "villas":
      return <WeekendThemedVillasSection />;
    default:
      return null;
  }
}

function renderPartySlot(section: CmsLandingSection) {
  const base = section.slotId.replace(/-copy-\d+$/, "");
  switch (base) {
    case "hero":
      return (
        <CmsExperienceHero
          cms={{
            heading: section.heading,
            description: section.body,
            backgroundImage: section.image,
          }}
          videoSlug="parties"
          scrollTargetId="party-philosophy"
          backgroundAlt="Party Villas"
          defaultHeading="Celebrate in Style with\nJade Party Villas"
          defaultDescription="Host birthdays, pool parties, reunions or milestone celebrations in exclusive Jade villas with private pools, curated setups & personalized experiences."
          defaultImage="/Experiences/Party Villas/1-Hero/Pool Parties.webp"
          villaScrollKey="party"
          brochurePath="/brochure.pdf"
        />
      );
    case "philosophy":
      return <ExperienceScrollSection variant="party" id="party-philosophy" />;
    case "carousel":
      return <PartyCarouselSection />;
    case "experiences":
      return <PartyExperiencesSection />;
    case "features":
      return <PartyFeaturesSection />;
    case "villas":
      return (
        <>
          <SectionFillTransition from="deep" to="charcoal" />
          <PartyVillasCarousel />
        </>
      );
    default:
      return null;
  }
}

function renderExperiencesSlot(section: CmsLandingSection) {
  const base = section.slotId.replace(/-copy-\d+$/, "");
  switch (base) {
    case "hero":
      return (
        <CmsExperiencesHubHero
          cms={{
            heading: section.heading,
            description: section.body,
          }}
        />
      );
    case "list":
      return (
        <div id="experiences-list">
          <ExperiencesScrollSection />
        </div>
      );
    default:
      return null;
  }
}

export function renderLandingSlot(
  templateKey: string,
  section: CmsLandingSection,
): React.ReactNode {
  if (
    section.landingKind === "rich-text" ||
    section.slotId.startsWith("custom-rich")
  ) {
    return <LandingRichSection section={section} />;
  }

  let native: React.ReactNode = null;
  switch (templateKey) {
    case "landing/weddings":
      native = renderWeddingsSlot(section);
      break;
    case "landing/corporate-retreats":
      native = renderCorporateSlot(section);
      break;
    case "landing/weekend-getaways":
      native = renderWeekendSlot(section);
      break;
    case "landing/party-villas":
      native = renderPartySlot(section);
      break;
    case "landing/experiences":
      native = renderExperiencesSlot(section);
      break;
  }

  if (native) return native;
  if (section.landingKind === "hero") {
    return <LandingRichSection section={section} />;
  }
  return null;
}
