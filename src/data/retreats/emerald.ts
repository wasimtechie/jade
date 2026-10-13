import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const emeraldPerfectForCards = [
    {
      title: "Couple Retreats",
      image: "/Villa_Retreats/Emerald/4-Perfect for/Couple Retreats.webp",
    },
    {
      title: "Friends & Family",
      image: "/Villa_Retreats/Emerald/4-Perfect for/Friends & Family.webp",
    },
    {
      title: "Staycations",
      image: "/Villa_Retreats/Emerald/4-Perfect for/Staycations.webp",
    },
    {
      title: "Weekend Getaways",
      image: "/Villa_Retreats/Emerald/4-Perfect for/Weekend getaways.webp",
    },
  ];

const emeraldBase = {
  id: "emerald",
  name: "Emerald",
  type: "HERITAGE GLASSHOUSE VILLA",
  location: "5 min Embassy Riding School",
  stats: {
    stay: "Up to 8 Guests (10 max)",
    events: "Up to 25 Guests",
    bhk: "2 BHK",
    lawn: "2,800 sq.ft Garden",
    villaArea: "2,016 sq.ft · 1 acre",
  },
  description:
    "Emerald is a private pool villa designed as a traditional glasshouse around a central courtyard. This 2-bedroom villa combines indoor transparency with lush greenery, creating a setting suited for small group stays, intimate gatherings, and weekend getaways near Bangalore. With a private pool featuring an 8 ft waterfall, garden sit-outs, and courtyard living, the villa balances built space with open areas. Located 5 minutes from Embassy Riding School and 35 minutes from Hebbal, it offers accessibility with complete privacy.",
  perfectForCards: emeraldPerfectForCards,
  perfectForTags: perfectForTagsFromCards(emeraldPerfectForCards),
  categories: ["Luxury Stays", "Party Venues", "Weekend Getaways", "Pet Friendly"],
  image: "/Villa_Retreats/Emerald/Hero/hero.webp",
  images: [
    "/Villa_Retreats/Emerald/Spaces/Villa.webp",
    "/Villa_Retreats/Emerald/Spaces/Pool.webp",
    "/Villa_Retreats/Emerald/Spaces/Living_Area.webp",
    "/Villa_Retreats/Emerald/Spaces/Bed_Room_1.webp",
    "/Villa_Retreats/Emerald/Spaces/Dining_Area.webp",
    "/Villa_Retreats/Emerald/Spaces/Gazebo.webp",
  ],
  amenities: [
    { label: "Private Pool", icon: "Waves" },
    { label: "Airconditioned Interiors", icon: "Wind" },
    { label: "Central Courtyard", icon: "Sun" },
    { label: "Glasshouse Living Area", icon: "Home" },
    { label: "Entertainment Systems", icon: "Music" },
    { label: "Outdoor Seating", icon: "Sofa" },
    { label: "Barbecue Setup", icon: "Flame" },
    { label: "Dry Kitchen", icon: "Utensils" },
    { label: "Ample Parking", icon: "Car" },
    { label: "Tableware & Utensils", icon: "Coffee" },
    { label: "First Aid Kit", icon: "Cross" },
  ],
  spaces: [
    { name: "Waterfall Pool", image: "/Villa_Retreats/Emerald/Hero/hero.webp" },
    {
      name: "Glass House Interior",
      image: "/Villa_Retreats/Emerald/Spaces/spaces_01.webp",
    },
    {
      name: "Central Courtyard",
      image: "/Villa_Retreats/Emerald/Spaces/spaces_02.webp",
    },
    {
      name: "Garden Sit-out",
      image: "/Villa_Retreats/Emerald/Spaces/spaces_03.webp",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "A private chef can be arranged for pool parties, brunches, and curated dining experiences.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "Dedicated on-site support to manage your stay and ensure a premium experience.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description:
        "Transport assistance available for guest arrivals and departures.",
      footer: "Service scope to be confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with personalised decor and arrangements for social events and celebrations.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  propertyDetails: [
    {
      label: "2-Bedroom Glasshouse Villa",
      description:
        "A traditional glasshouse villa built around a central courtyard, designed for small group stays.",
      icon: "Home",
    },
    {
      label: "Private Enclosed Property",
      description:
        "Set within a green, gated space offering privacy for stays and small gatherings.",
      icon: "Lock",
    },
    {
      label: "Private Pool with Waterfall",
      description:
        "Features an aqua-blue pool with an 8 ft cascading waterfall and deck-side access.",
      icon: "Waves",
    },
    {
      label: "Central Courtyard Layout",
      description:
        "The villa is organised around a glass-covered courtyard with seating and a swing.",
      icon: "Sun",
    },
    {
      label: "Garden with Sit-out Areas",
      description:
        "Outdoor spaces include low seating zones and landscaped greenery across the property.",
      icon: "Leaf",
    },
    {
      label: "Stay & Gathering Capacity",
      description:
        "Accommodates up to 10 guests for stay and 25-30 guests for small gatherings.",
      icon: "Users",
    },
  ],

  locationDetails: {
    mapImage: "",
    address:
      "Emerald, Milk Dairy Circle, Sulikunte, Kundana, Bengaluru, Karnataka 562110",
    distance: "Approximately 35 minutes from Hebbal",
    nearby: [
      { label: "EMBASSY RIDING SCHOOL", distance: "5 mins away" },
      { label: "AIRPORT", distance: "45 mins away" },
      { label: "NANDI HILLS", distance: "1 hour away" },
    ],
  },
  activities: [
    {
      title: "BBQ",
      image: "/Villa_Retreats/Emerald/3-Experiences/BBQ.webp",
    },
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Emerald/3-Experiences/Bonfire.webp",
    },
    {
      title: "Candlelit Dining",
      image: "/Villa_Retreats/Emerald/3-Experiences/Candlelit Dining.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Emerald/3-Experiences/Floating Breakfast.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Emerald/3-Experiences/High Tea.webp",
    },
    {
      title: "Movie under the stars",
      image: "/Villa_Retreats/Emerald/3-Experiences/movie under the stars.webp",
    },
    {
      title: "Picnic Setup",
      image: "/Villa_Retreats/Emerald/3-Experiences/Picnic Setup.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "master-bedroom",
      title: "Master Bedroom",
      category: "Bed & Bath",
      amenities: [
        "King bed",
        "Floor mattress",
        "Ceiling fan",
        "Room-darkening blinds",
        "Air conditioning",
        "5 Seater Sofa",
      ],
      images: [
        "/Villa_Retreats/Emerald/Spaces/spaces_05.webp",
        "/Villa_Retreats/Emerald/Spaces/spaces_06.webp",
      ],
    },
    {
      id: "guest-bedroom",
      title: "Guest Bedroom",
      category: "Bed & Bath",
      amenities: [
        "King bed",
        "Floor mattress",
        "Ceiling fan",
        "Room-darkening blinds",
        "Air conditioning",
        "5 Seater Sofa",
      ],
      images: [
        "/Villa_Retreats/Emerald/Spaces/spaces_07.webp",
        "/Villa_Retreats/Emerald/Spaces/spaces_08.webp",
      ],
    },
    {
      id: "lawn",
      title: "Lawn",
      category: "Outdoors",
      amenities: [
        "Private pool access",
        "Garden sit-out",
        "Bonfire zone",
        "Barbecue setup",
      ],
      images: [
        "/Villa_Retreats/Emerald/Spaces/spaces_09.webp",
        "/Villa_Retreats/Emerald/Spaces/spaces_10.webp",
      ],
    },
    {
      id: "living-area",
      title: "Living Area",
      category: "Indoors",
      amenities: [
        "Central courtyard swing",
        "Entertainment system",
        "Fully functional kitchen",
        "Lounge seating",
      ],
      images: [
        "/Villa_Retreats/Emerald/Spaces/spaces_11.webp",
        "/Villa_Retreats/Emerald/Spaces/spaces_12.webp",
      ],
    },
  ],
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=mxoLej0IqmY",
    thumbnail: "/Villa_Retreats/Emerald/Hero/hero.webp",
    duration: "1:18",
  },
  faq: [
    {
      question: "Is the villa pet-friendly?",
      answer:
        "Yes, Emerald is a pet-friendly property with enclosed garden spaces for your furry friends.",
    },
    {
      question: "What is the pool depth?",
      answer:
        "The pool is approximately 4 ft deep. No lifeguard is provided — we recommend supervision at all times.",
    },
    {
      question: "Is catering available?",
      answer:
        "Yes, catering can be arranged on request through our chef on call service.",
    },
  ],
};

export const emerald = {
  ...emeraldBase,
  amenityHighlights: amenityHighlightsFrom(emeraldBase.amenities),
};
