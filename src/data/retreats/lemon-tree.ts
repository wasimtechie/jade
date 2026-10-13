import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const lemonTreePerfectForLegacy = [
    "Group Getaways",
    "Nature Stays",
    "Family Celebrations",
    "Staycations",
    "Team Outings",
  ];

const lemonTreeBase = {
  id: "lemon-tree",
  name: "Lemon Tree",
  type: "3-BEDROOM FARMSTAY · ROOFTOP POOL",
  location: "25 min IKEA · lemon plantation",
  stats: {
    stay: "Up to 10 Guests (25 max)",
    events: "Up to 50–60 Guests",
    bhk: "3 BHK",
    lawn: "Plantation grounds",
    villaArea: "5,000 sq.ft · rooftop pool",
  },
  description:
    "Lemon Tree is a nature retreat set within a lemon orchard, designed for relaxed stays and group gatherings. The 3-bedroom villa combines indoor comfort with expansive outdoor spaces, creating a countryside experience within close reach of the city. With a private rooftop pool, multipurpose hall, and orchard setting, the property supports both stays and small events. Surrounded by greenery and open views, it offers a quiet environment for extended stays and group retreats.",
  categories: ["Nature Retreats", "Weekend Getaways", "Pet Friendly"],
  thumbnail: "",
  image: "",
  images: ["", "", "", "", "", ""],
  amenities: [
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
  ],
  propertyDetails: [
    {
      label: "3-Bedroom Villa",
      description: "A compact villa layout designed for group stays.",
      icon: "Bed",
    },
    {
      label: "Rooftop Private Pool",
      description:
        "Private pool located on the rooftop for elevated views and relaxation.",
      icon: "Waves",
    },
    {
      label: "3-Acre Orchard Property",
      description: "Set within a large lemon grove with dense greenery.",
      icon: "Trees",
    },
    {
      label: "Multipurpose Hall",
      description:
        "Convertible indoor space that can function as a dormitory for larger groups.",
      icon: "Home",
    },
    {
      label: "Group-Friendly Layout",
      description:
        "Accommodates up to 25 overnight guests and 50 for social gatherings.",
      icon: "Users",
    },
    {
      label: "Countryside Setting",
      description: "Surrounded by scenic views and nature-based environments.",
      icon: "Map",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef service available for curated orchard-style meals and specialized catering.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support to handle guest logistics, housekeeping, and personalized assistance.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description:
        "Transport support available for guest transfers to and from the property.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with personalized decor and event arrangements for small gatherings and celebrations.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "Camping Experiences",
      description: "Outdoor stay setups within the orchard environment.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_01.webp",
    },
    {
      title: "Barbecue Experiences",
      description: "Dedicated BBQ setup for outdoor cooking and dining.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_02.webp",
    },
    {
      title: "Bonfire Evenings",
      description: "Outdoor bonfire setups for group gatherings.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_03.webp",
    },
    {
      title: "Candle Corner Dining",
      description: "Dedicated candlelit dining setups within the villa.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_04.webp",
    },
    {
      title: "Family Dining Experiences",
      description: "Group dining setups across indoor and outdoor zones.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_05.webp",
    },
    {
      title: "Lounge Experiences",
      description: "Relaxed indoor lounge setups for social time.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_06.webp",
    },
    {
      title: "Cooking Experiences",
      description: "Interactive cooking-based group experiences.",
      image: "/Villa_Retreats/Lemon Tree/Experiences/experiences_07.webp",
    },
  ],
  spaces: [
    { name: "Courtyard", image: "" },
    { name: "Rooftop Pool", image: "" },
    { name: "Multipurpose Hall", image: "" },
    { name: "Lemon Grove", image: "" },
  ],
  categorizedSpaces: [
    {
      id: "main-space",
      title: "Main Space",
      category: "Indoors",
      amenities: [
        "Comfortable seating",
        "Ambient lighting",
        "Air conditioning",
        "Entertainment setup",
      ],
      images: [],
    },
  ],

  locationDetails: {
    mapImage: "",
    address: "735, Jade Garden Phase II, Sadahalli, Bangalore — 562110",
    distance: "Approximately 60 minutes from Bangalore City Center",
    nearby: [
      { label: "HONNASANDRA LAKE", distance: "10 mins away" },
      { label: "EXHIBITION CENTRE", distance: "20 mins away" },
      { label: "SHIVAGANGE HILLS", distance: "30 mins away" },
      { label: "HULIYURDURGA", distance: "40 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=ZJwPuw4evSM",
    thumbnail: "",
    duration: "1:28",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 25 guests can be accommodated.",
    },
    {
      question: "Is the property suitable for events?",
      answer: "Yes, suitable for gatherings up to 50 guests.",
    },
    {
      question: "Is the pool private?",
      answer: "Yes, the rooftop pool is exclusively for guests.",
    },
    {
      question: "Are meals included?",
      answer: "Meals can be arranged on request.",
    },
    {
      question: "Is this suitable for large parties?",
      answer:
        "Suitable for small to mid-sized gatherings, not large-scale events.",
    },
  ],
};

const lemonTreePerfectFor = splitLegacyPerfectFor(
  lemonTreePerfectForLegacy,
  (lemonTreeBase.images?.length ? lemonTreeBase.images : [lemonTreeBase.image].filter(Boolean)) as string[],
);

export const lemonTree = {
  ...lemonTreeBase,
  amenityHighlights: amenityHighlightsFrom(lemonTreeBase.amenities),
  perfectForTags: lemonTreePerfectFor.perfectForTags,
  perfectForCards: lemonTreePerfectFor.perfectForCards,
};
