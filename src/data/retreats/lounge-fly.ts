import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const loungeFlyPerfectForLegacy = [
    "Couple Stays",
    "Short Getaways",
    "City Escapes",
    "Solo Travelers",
    "Boutique Stays",
  ];

const loungeFlyBase = {
  id: "lounge-fly",
  name: "Lounge Fly",
  type: "LUXURY APARTMENT SUITE",
  location: "Bhartiya City, Bangalore",
  stats: {
    stay: "4 Guests Stay",
    events: "20 Guests",
    bhk: "1 BHK Suite",
    lawn: "Dual Balcony Views",
    villaArea: "High-Floor Living",
  },
  description:
    "Lounge Fly is a luxury apartment suite located in the heart of Bhartiya City, designed for short stays and private escapes. The 1-bedroom layout combines compact living with elevated interiors and city-facing views. With dual balconies, direct access to the mall and Leela Hotel, and curated lounge-style interiors, the space offers a premium urban stay experience. Designed for comfort and privacy, it suits couples, solo stays, and small groups.",
  categories: ["Luxury Stays", "Weekend Getaways", "Corporate Retreats"],
  thumbnail: "/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp",
  image: "/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp",
  images: [
    "/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp",
    "/Villa_Retreats/Lounge Fly/2-Spaces/Pool Villa.webp",
    "/Villa_Retreats/Lounge Fly/2-Spaces/living area day.webp",
    "/Villa_Retreats/Lounge Fly/2-Spaces/Bedroom day.webp",
    "/Villa_Retreats/Lounge Fly/2-Spaces/garden view.webp",
    "/Villa_Retreats/Lounge Fly/2-Spaces/luxury decor.webp",
  ],
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
      label: "1-Bedroom Luxury Suite",
      description: "Compact apartment layout designed for up to 4 guests.",
      icon: "Bed",
    },
    {
      label: "Dual Balcony Views",
      description:
        "Balconies overlooking the Leela Hotel pool and city skyline.",
      icon: "Sun",
    },
    {
      label: "High-Floor Living",
      description:
        "Positioned on an elevated floor with open city views and ventilation.",
      icon: "Home",
    },
    {
      label: "Connected Location",
      description: "Panoramic views of the Varlakonda hills from the property.",
      icon: "MapPin",
    },
    {
      label: "Curated Interiors",
      description:
        "Backlit panels, lounge-style lighting, and premium finishes.",
      icon: "Star",
    },
    {
      label: "Fully Functional Kitchen",
      description: "Equipped kitchen integrated into the living space.",
      icon: "Kitchen",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef service can be arranged for curated in-suite meals and small gatherings.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support available for events or hosted stays to ensure a seamless experience.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description:
        "Transport support available on request for airport transfers or city movement.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with personalized decor and arrangements for small, intimate celebrations.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "Poolside Evenings",
      description: "Relax by the private pool overlooking the garden area.",
      image: "/Villa_Retreats/Lounge Fly/2-Spaces/Pool Villa.webp",
    },
    {
      title: "Outdoor Barbecue",
      description: "Dedicated bonfire and BBQ setups for social gatherings.",
      image: "/Villa_Retreats/Lounge Fly/2-Spaces/Bar Coubnter.webp",
    },
    {
      title: "Lounge Relaxation",
      description:
        "Spend time in the aesthetic living and outdoor lounge areas.",
      image: "/Villa_Retreats/Lounge Fly/2-Spaces/Sofa Loungers.webp",
    },
    {
      title: "Candlelight Dining",
      description: "Curated private dining setups within the villa interiors.",
      image: "/Villa_Retreats/Lounge Fly/2-Spaces/luxury decor.webp",
    },
    {
      title: "Work from Nature",
      description:
        "Quiet and aesthetic environment for focused extended stays.",
      image: "/Villa_Retreats/Lounge Fly/2-Spaces/Bedroom Lounger.webp",
    },
  ],
  spaces: [
    {
      name: "Luxury Lounge",
      image: "/Villa_Retreats/Lounge Fly/Spaces/IMG_4560.webp",
    },
    {
      name: "Master Suite",
      image: "/Villa_Retreats/Lounge Fly/Spaces/IMG_4763.webp",
    },
    {
      name: "City Balcony",
      image: "/Villa_Retreats/Lounge Fly/Spaces/IMG_4789.webp",
    },
    {
      name: "Kitchenette",
      image: "/Villa_Retreats/Lounge Fly/Spaces/IMG_9296.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "luxury-lounge",
      title: "Luxury Lounge",
      category: "Indoors",
      amenities: [
        "Comfortable seating",
        "Ambient lighting",
        "Air conditioning",
        "Entertainment setup",
      ],
      images: [
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_4560.webp",
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_4763.webp",
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_4789.webp",
      ],
    },
    {
      id: "master-suite",
      title: "Master Suite",
      category: "Bed & Bath",
      amenities: [
        "King bed",
        "Air conditioning",
        "Room-darkening blinds",
        "Wardrobe",
        "En-suite bathroom",
      ],
      images: [
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_4763.webp",
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_9296.webp",
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_9299.webp",
      ],
    },
    {
      id: "city-balcony",
      title: "City Balcony",
      category: "Indoors",
      amenities: [
        "Comfortable seating",
        "Ambient lighting",
        "Air conditioning",
        "Entertainment setup",
      ],
      images: [
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_4789.webp",
        "/Villa_Retreats/Lounge Fly/Spaces/IMG_9300.webp",
      ],
    },
    {
      id: "kitchenette",
      title: "Kitchenette",
      category: "Indoors",
      amenities: [
        "Comfortable seating",
        "Ambient lighting",
        "Air conditioning",
        "Entertainment setup",
      ],
      images: ["/Villa_Retreats/Lounge Fly/Spaces/IMG_9296.webp"],
    },
  ],

  locationDetails: {
    mapImage: "",
    address:
      "Bhartiya City, Thanisandra Main Road, Bangalore (Near Leela Hotel)",
    distance: "Approximately 45 minutes from KIAL Airport",
    nearby: [
      { label: "BHARTIYA MALL", distance: "Walking distance" },
      { label: "LEELA HOTEL", distance: "Within premises" },
      { label: "PVR CINEMAS", distance: "Walking distance" },
      { label: "BREWERIES & RESTAURANTS", distance: "Within complex" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=THDUAhzF_Sg",
    thumbnail: "/Villa_Retreats/Lounge Fly/1-Hero/Hero.webp",
    duration: "1:29",
  },
  faq: [
    {
      question: "How many guests can stay?",
      answer: "Up to 4 guests can be accommodated.",
    },
    {
      question: "Is this suitable for events?",
      answer: "No, this is designed for private stays only.",
    },
    {
      question: "Is food included?",
      answer: "Food is not included but can be ordered or arranged.",
    },
    {
      question: "Does the property have a kitchen?",
      answer: "Yes, a fully functional kitchen is available.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, parking is available within the premises.",
    },
  ],
};

const loungeFlyPerfectFor = splitLegacyPerfectFor(
  loungeFlyPerfectForLegacy,
  (loungeFlyBase.images?.length ? loungeFlyBase.images : [loungeFlyBase.image].filter(Boolean)) as string[],
);

export const loungeFly = {
  ...loungeFlyBase,
  amenityHighlights: amenityHighlightsFrom(loungeFlyBase.amenities),
  perfectForTags: loungeFlyPerfectFor.perfectForTags,
  perfectForCards: loungeFlyPerfectFor.perfectForCards,
};
