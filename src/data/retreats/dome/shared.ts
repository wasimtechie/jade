import {
  DOME_COLOR_META,
  type DomeColorKey,
} from "@/lib/domeVillaIds";
import type { VillaActivity, VillaStats } from "@/lib/types";
import { DOME_VIDEO_URLS } from "@/lib/videoUtils";
import {
  amenityHighlightsFrom,
  perfectForTagsFromCards,
} from "@/lib/villaDetailData";
import type { VillaPerfectForCard } from "@/lib/types";

export const BLUE_DOME_IMAGES = [
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 1.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 3.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 4.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 5.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/1st_Floor_sit_out.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Bed-Room_1.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Bed_Room_2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Bed_Room_3.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Bed_Room_Hill_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Blue_Dome.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Dome_Side_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Glamping_Experince.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Hill_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Lawn_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Living_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/OutDoor_Sit_Out.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Private_Plunge_Pool.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Blue/Spaces/Walk_way.webp",
];

export const RED_DOME_IMAGES = [
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 1.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 3.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 4.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 5.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 6.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Bath_Tub.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Bed_Room_1.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Bed_Room_2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Bed_Room_3.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Entrance.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Exit.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Front_Yard.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Hobbit_Hole_Window.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Hobbit_Hole_entrance.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Kids_Pool.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Lawn_area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Living_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/OutDoor_Sit_Out.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Pool.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Pool_Side_Sit_Out.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Pool_with_Hill_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Semi_Open_Dining_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Red/Spaces/Wall_Unit_Artifacts.webp",
];

export const YELLOW_DOME_IMAGES = [
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/Hero_evening_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/hero.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Bed_Room_.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Bed_Room_1.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Bed_Room_2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Corridor_Walk_way.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Dining_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Greek_Style_Bath.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Inner_Court_Yard_Entrance.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Inner_Court_Yard_Entrance_2.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Living_Area.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Living_Area_Hobbit_Hole.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Living_Area_entrance.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Master_Bed_Room.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Master_Bed_Room_Night_View.webp",
  "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Spaces/Patio_Sit_Out.webp",
];

export const DOME_GROUP_AMENITIES = [
  "Comfortable seating",
  "Ambient lighting",
  "Air conditioning",
  "Entertainment setup",
];

/** Shared experiences for estate + Blue / Red / Yellow dome detail pages */
export const DOME_ESTATE_ACTIVITIES: VillaActivity[] = [
  {
    title: "Barbecue Experiences",
    description: "Self-use grill setups for group cooking.",
    image: "/Villa_Retreats/Dome/3-Experienceee/barbeque.webp",
  },
  {
    title: "Bonfire Evenings",
    description: "Outdoor bonfire for gatherings.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Bonfire.webp",
  },
  {
    title: "Movie Under The Stars",
    description: "Projector-based viewing experience.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Movie Under The Stars.webp",
  },
  {
    title: "Candlelit Dining",
    description: "A private dining setup under warm lights.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Candlelit Dining.webp",
  },
  {
    title: "Picnic Setup",
    description: "Curated picnic moments in the garden.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Picnic Setup.webp",
  },
  {
    title: "Floating Breakfast",
    description: "Breakfast served in the pool for a relaxed start.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Floating Breakfast.webp",
  },
  {
    title: "Outdoor Activities",
    description: "Open-air games and group-friendly activities.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Outdoor Activities.webp",
  },
  {
    title: "Indoor Games",
    description: "Board games and indoor entertainment for groups.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Indoor Games.webp",
  },
  {
    title: "High Tea",
    description: "Evening tea with light bites in a cozy setting.",
    image: "/Villa_Retreats/Dome/3-Experienceee/High Tea.webp",
  },
  {
    title: "Zen Garden",
    description: "Quiet outdoor corners for slow, peaceful time.",
    image: "/Villa_Retreats/Dome/3-Experienceee/Zen Garden.webp",
  },
];

export const DOME_PERFECT_FOR_CARDS: VillaPerfectForCard[] = [
  {
    title: "Pool Parties",
    image: "/Villa_Retreats/Dome/Perfect For/Pool Parties.webp",
  },
  {
    title: "Group Getaways",
    image: "/Villa_Retreats/Dome/Perfect For/Group Getaways.webp",
  },
  {
    title: "Nature Stays",
    image: "/Villa_Retreats/Dome/Perfect For/Nature Stays.webp",
  },
  {
    title: "Intimate Weddings",
    image: "/Villa_Retreats/Dome/Perfect For/Intimate Weddings.webp",
  },
];

const DOME_AMENITIES = [
  { label: "Private Pool", icon: "Waves" },
  { label: "Airconditioned Interiors", icon: "Wind" },
  { label: "Outdoor Seating", icon: "Sofa" },
  { label: "Jacuzzi", icon: "Waves" },
  { label: "Entertainment Systems", icon: "Music" },
  { label: "Bonfire Setup", icon: "Flame" },
  { label: "Barbecue Setup", icon: "Utensils" },
  { label: "Fully Functional Kitchen", icon: "Kitchen" },
  { label: "LCD Television", icon: "Tv" },
  { label: "Tableware & Utensils", icon: "Coffee" },
  { label: "Power Backup", icon: "Zap" },
  { label: "Parking", icon: "Car" },
];

/** Estate-wide capacity (dome-villas listing + detail). */
export const DOME_ESTATE_STATS: VillaStats = {
  stay: "Up to 24 Guests (3 villas)",
  events: "Up to 35 Guests (cluster)",
  bhk: "3 Domes · 3 BR each",
  lawn: "Shared cluster stage",
  villaArea: "Doddaballapur hills",
};

/** Per-dome showcase pages (blue / red / yellow detail). */
export const DOME_SINGLE_UNIT_STATS: VillaStats = {
  stay: "Up to 8 Guests",
  events: "Up to 16 Guests",
  bhk: "3 BR",
  lawn: "Private plunge pool",
  villaArea: "Dome villa",
};

export const DOME_ESTATE_SHARED = {
  type: "DOME VILLA CLUSTER · 3 PRIVATE VILLAS",
  location: "Doddaballapur · 30 min airport toll",
  stats: DOME_ESTATE_STATS,
  categories: ["Nature Retreats", "Weekend Getaways", "Luxury Stays"],
  amenities: DOME_AMENITIES,
  amenityHighlights: amenityHighlightsFrom(DOME_AMENITIES),
  perfectForCards: DOME_PERFECT_FOR_CARDS,
  perfectForTags: perfectForTagsFromCards(DOME_PERFECT_FOR_CARDS),
  activities: DOME_ESTATE_ACTIVITIES,
  services: [
    {
      title: "Chef on Call",
      description: "Private chef for curated meals across the estate.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description: "On-site support for group logistics and event management.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description: "Transport support for guest arrivals and departures.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with decor and arrangements for small celebrations.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  locationDetails: {
    mapImage: "",
    address: "Chinnapathirali Village, Shoolagiri, Tamil Nadu 635105",
    distance: "Approximately 45 minutes from Sarjapur",
    nearby: [
      { label: "MAKALI DURGA", distance: "15 mins away" },
      { label: "HALU CHILUME", distance: "15 mins away" },
      { label: "SUNSET VIEW POINT", distance: "30 mins away" },
    ],
  },
};

const DOME_IMAGES_BY_COLOR: Record<DomeColorKey, string[]> = {
  blue: BLUE_DOME_IMAGES,
  red: RED_DOME_IMAGES,
  yellow: YELLOW_DOME_IMAGES,
};

function heroImagesForColor(images: string[]): string[] {
  const heroes = images.filter((u) => u.includes("/Hero/"));
  return heroes.length > 0 ? heroes : images.slice(0, 5);
}

export function buildSingleDomeVilla(color: DomeColorKey) {
  const meta = DOME_COLOR_META[color];
  const colorImages = DOME_IMAGES_BY_COLOR[color];
  const heroes = heroImagesForColor(colorImages);

  return {
    ...DOME_ESTATE_SHARED,
    id: meta.id,
    name: meta.name,
    type: `HOBBIT THEMED · ${meta.categoryLabel.toUpperCase()}`,
    stats: DOME_SINGLE_UNIT_STATS,
    pricing: undefined,
    description: `The ${meta.shortLabel} is one of three dome villas at the Doddaballapur cluster. Book the full estate for all three domes, or explore this villa's plunge pool, outdoor dining, and hill views below.`,
    thumbnail: heroes[0] ?? colorImages[0],
    image: heroes[0] ?? colorImages[0],
    images: colorImages,
    activities: DOME_ESTATE_ACTIVITIES,
    spaces: [{ name: meta.shortLabel, image: colorImages[0] }],
    categorizedSpaces: [
      {
        id: `${color}-dome`,
        title: meta.shortLabel,
        category: meta.categoryLabel,
        amenities: DOME_GROUP_AMENITIES,
        images: colorImages,
      },
    ],
    propertyDetails: [
      {
        label: meta.shortLabel,
        description:
          "A standalone dome villa within the private Dome Villas estate, with its own bedroom, bath, and outdoor sit-out.",
        icon: "Building",
      },
      {
        label: "Hobbit-Themed Architecture",
        description:
          "Curved forms, warm interiors, and nature-forward design unique to this dome.",
        icon: "Layout",
      },
      {
        label: "Pool & Outdoor Living",
        description:
          "Access to estate pool zones and landscaped outdoor areas (full-estate booking).",
        icon: "Waves",
      },
      {
        label: "Landscaped Grounds",
        description:
          "Pathways and garden zones connect this dome to the wider estate.",
        icon: "Trees",
      },
      {
        label: "Exclusive Estate Booking",
        description:
          "The three domes are reserved together for one group — not shared with other guests.",
        icon: "Lock",
      },
    ],
    video: {
      youtubeUrl: DOME_VIDEO_URLS[color],
      thumbnail:
        color === "blue"
          ? "/Villa_Retreats/Dome/Dome Villa_s - Blue/Hero/Hero 1.webp"
          : color === "red"
            ? "/Villa_Retreats/Dome/Dome Villa_s - Red/Hero/Hero 1.webp"
            : "/Villa_Retreats/Dome/Dome Villa_s - Yellow/Hero/Hero_evening_View.webp",
      duration: "1:21",
    },
    faq: [
      {
        question: "Can I book only this dome?",
        answer:
          "Dome Villas is booked as a private estate with all three domes for one group. This page showcases the spaces and layout of this dome.",
      },
      {
        question: "How many guests can the estate accommodate?",
        answer: "Up to 18 guests can be accommodated across all three domes.",
      },
      {
        question: "Is the pool private?",
        answer:
          "Yes, pool and outdoor areas are for guests of the exclusively booked estate.",
      },
      {
        question: "Are meals included?",
        answer: "Meals can be arranged on request.",
      },
    ],
  };
}
