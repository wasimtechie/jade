import { amenityHighlightsFrom } from "@/lib/villaDetailData";

const havenPerfectForCards = [
    {
      title: "Family Gatherings",
      image: "/Villa_Retreats/Haven/4-Perfect for/Family Gatherings.webp",
    },
    {
      title: "Staycation",
      image: "/Villa_Retreats/Haven/4-Perfect for/Staycation.webp",
    },
    {
      title: "Small Scale Celebrations",
      image:
        "/Villa_Retreats/Haven/4-Perfect for/small scale celebrations.webp",
    },
    {
      title: "Weddings",
      image: "/Villa_Retreats/Haven/4-Perfect for/weddings.webp",
    },
  ];

const havenBase = {
  id: "haven",
  name: "Haven",
  type: "5-BEDROOM POOL VILLA",
  location: "10 min Byg Brewski · Hennur",
  stats: {
    stay: "Up to 12 Guests (25 max)",
    events: "100–150 seated · 800 floating",
    bhk: "5 BHK",
    lawn: "17,600 sq.ft Lawn",
    villaArea: "3,500 sq.ft · race-track view",
  },
  description:
    "Haven is a 4-bedroom private villa designed for group stays and social gatherings, combining modern interiors with open outdoor spaces. With a private pool, lawn, and large shared areas, the villa supports both relaxed stays and larger gatherings in a controlled, private setting.",
  perfectForCards: havenPerfectForCards,
  perfectForTags: ["Private Celebrations", "Couple Retreat"],
  categories: ["Luxury Stays", "Party Venues", "Weekend Getaways", "Weddings"],
  image: "/Villa_Retreats/Haven/Hero/hero.webp",
  images: [
    "/Villa_Retreats/Haven/Spaces/Villa_Entrance.webp",
    "/Villa_Retreats/Haven/Spaces/Pool.webp",
    "/Villa_Retreats/Haven/Spaces/Living_area.webp",
    "/Villa_Retreats/Haven/Spaces/Bed_Room_1.webp",
    "/Villa_Retreats/Haven/Spaces/Dining_Area.webp",
    "/Villa_Retreats/Haven/Spaces/Lawn_area.webp",
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
      label: "4-Bedroom Private Villa",
      description: "Designed for mid-sized groups with shared common spaces.",
      icon: "Bed",
    },
    {
      label: "Private Standalone Property",
      description: "Independent villa ensuring privacy for guests.",
      icon: "Home",
    },
    {
      label: "Modern Interior Design",
      description: "Clean, contemporary interiors across all spaces.",
      icon: "Diamond",
    },
    {
      label: "Expansive Lawn Area",
      description: "Outdoor space for gatherings and activities.",
      icon: "Trees",
    },
    {
      label: "Large Living & Dining Areas",
      description: "Designed to accommodate group interactions comfortably.",
      icon: "Sofa",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef service available for curated meals and specialized event catering.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support to ensure your stay or event is managed seamlessly.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description:
        "Transport support can be arranged for guest arrival and departure logistics.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with personalized decor and technical arrangements for your gathering.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "BBQ",
      image: "/Villa_Retreats/Haven/3-Experiences/BARBEQUE.webp",
    },
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Haven/3-Experiences/BssONFIRE.webp",
    },
    {
      title: "Candlelit Dining",
      image: "/Villa_Retreats/Haven/3-Experiences/Candlelit dining.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Haven/3-Experiences/High Tea.webp",
    },
    {
      title: "Indoor Games",
      image: "/Villa_Retreats/Haven/3-Experiences/Indoor Games.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Haven/3-Experiences/floating breakfast.webp",
    },
    {
      title: "Movie Under The Stars",
      image: "/Villa_Retreats/Haven/3-Experiences/movie under the stars.webp",
    },
  ],
  spaces: [
    {
      name: "Private Pool",
      image: "/Villa_Retreats/Haven/Spaces/Pool.webp",
    },
    {
      name: "Main Lawn",
      image: "/Villa_Retreats/Haven/Spaces/Lawn_area.webp",
    },
    {
      name: "Living Area",
      image: "/Villa_Retreats/Haven/Spaces/Living_area.webp",
    },
    {
      name: "Pool Table Room",
      image: "/Villa_Retreats/Haven/Spaces/Pool_Table.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "indoors",
      title: "Villa Interiors",
      category: "Indoors",
      amenities: [
        "Spacious living room",
        "Pool table",
        "Dining area",
        "Family lounge",
      ],
      images: [
        "/Villa_Retreats/Haven/Spaces/Living_area.webp",
        "/Villa_Retreats/Haven/Spaces/Pool_Table.webp",
        "/Villa_Retreats/Haven/Spaces/Dining_Area.webp",
        "/Villa_Retreats/Haven/Spaces/Family_Room.webp",
      ],
    },
    {
      id: "outdoors",
      title: "Garden & Pool",
      category: "Outdoors",
      amenities: [
        "Private pool",
        "Large lawn area",
        "Outdoor seating",
        "Garden view",
      ],
      images: [
        "/Villa_Retreats/Haven/Spaces/Pool.webp",
        "/Villa_Retreats/Haven/Spaces/Lawn_area.webp",
      ],
    },
    {
      id: "bed-bath",
      title: "Bedrooms",
      category: "Bed & Bath",
      amenities: [
        "King beds",
        "En-suite bathrooms",
        "Jacuzzi",
        "Air conditioning",
      ],
      images: [
        "/Villa_Retreats/Haven/Spaces/Bed_Room_1.webp",
        "/Villa_Retreats/Haven/Spaces/Bed_Room_2.webp",
        "/Villa_Retreats/Haven/Spaces/Bed_Room_3.webp",
        "/Villa_Retreats/Haven/Spaces/Bath_Room_With_Jacuzzi.webp",
      ],
    },
  ],

  locationDetails: {
    mapImage: "",
    address: "Netaji Road, Mitganahalli, Marenahalli, Bengaluru — 562149",
    distance: "Approximately 45 minutes from Bangalore City Center",
    nearby: [
      { label: "FETCH CANINE", distance: "Behind property" },
      { label: "AIRPORT", distance: "20 km away" },
      { label: "HEBBAL", distance: "25 mins away" },
      { label: "NICE ROAD", distance: "15 km away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=3Aid-re90HE",
    thumbnail: "/Villa_Retreats/Haven/Hero/hero.webp",
    duration: "1:47",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 20 guests can be accommodated.",
    },
    {
      question: "What is the event capacity?",
      answer: "Yes, it supports gatherings of up to 100 guests.",
    },
    {
      question: "Is the pool private?",
      answer: "Yes, the pool is exclusively accessible to guests.",
    },
    {
      question: "Are meals included?",
      answer: "Breakfast is included. Other meals can be arranged.",
    },
    {
      question: "Is this suitable for large parties?",
      answer: "Not designed for large-scale events.",
    },
  ],
};

export const haven = {
  ...havenBase,
  amenityHighlights: amenityHighlightsFrom(havenBase.amenities),
};
