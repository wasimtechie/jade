import { amenityHighlightsFrom } from "@/lib/villaDetailData";

const palatioPerfectForCards = [
    {
      title: "Staycations",
      image: "/Villa_Retreats/Palatio/4-Perfect For/Staycations.webp",
    },
    {
      title: "Weekend Getaways",
      image: "/Villa_Retreats/Palatio/4-Perfect For/Weekend Getaways.webp",
    },
    {
      title: "Workation",
      image: "/Villa_Retreats/Palatio/4-Perfect For/Workation.webp",
    },
    {
      title: "Intimate Social Events",
      image:
        "/Villa_Retreats/Palatio/4-Perfect For/intimate Social Events.webp",
    },
  ];

const palatioBase = {
  id: "palatio",
  bookable: false,
  name: "Palatio",
  type: "PRIVATE NATURE RETREAT VILLA",
  location: "Harohalli, Bangalore",
  stats: {
    stay: "Up to 15 Guests",
    events: "60 Guests",
    bhk: "2 BHK",
    lawn: "Landscaped Gardens",
    villaArea: "Nature Retreat",
  },
  description:
    "Palatio is a 2-bedroom private villa set on a 2-acre estate, designed with stone architecture and open natural elements. The layout integrates indoor and outdoor spaces through courtyards, water features, and expansive greens. With a stone pool, inner courtyard, and large lawn, the property is suited for intimate stays as well as larger social gatherings in a natural setting.",
  perfectForCards: palatioPerfectForCards,
  perfectForTags: ["Intimate Social Events", "Couple Retreats"],
  categories: [
    "Nature Retreats",
    "Party Venues",
    "Weekend Getaways",
    "Pet Friendly",
  ],
  thumbnail: "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
  image: "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
  images: [
    "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 2.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 3.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 4.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 5.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 6.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 7.webp",
    "/Villa_Retreats/Palatio/1-Hero/Hero 8.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Villa.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Private_Pool.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Walk_on_The_Water.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Living_Area.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Bed_Room_1.webp",
    "/Villa_Retreats/Palatio/2-Spaces/Dining_Area.webp",
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
      label: "2-Bedroom Private Villa",
      description: "Designed for small group stays with shared living spaces.",
      icon: "Bed",
    },
    {
      label: "2-Acre Estate Setting",
      description: "Standalone property surrounded by greenery and open land.",
      icon: "Map",
    },
    {
      label: "Stone Architecture Design",
      description:
        "Rustic stone walls and natural material finishes across spaces.",
      icon: "Building",
    },
    {
      label: "Inner Courtyard with Glass Roof",
      description: "Central courtyard bringing in daylight and open-sky views.",
      icon: "Sun",
    },
    {
      label: "Private Stone Pool",
      description:
        "Pool designed with natural stone finish and surrounding deck.",
      icon: "Waves",
    },
    {
      label: "Expansive Lawn Area",
      description: "Open outdoor space for gatherings and activities.",
      icon: "Trees",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef available for curated meals and event catering.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description: "On-site service support for stays and events.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description: "Transport support available on request.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description: "Assistance with decor and arrangements for social events.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Palatio/3-Experiences/Bonfire.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Palatio/3-Experiences/High Tea.webp",
    },
    {
      title: "BBQ",
      image: "/Villa_Retreats/Palatio/3-Experiences/bbbq.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Palatio/3-Experiences/floating breakfast.webp",
    },
  ],
  spaces: [
    {
      name: "Pool Courtyard",
      image: "/Villa_Retreats/Palatio/2-Spaces/Private_Pool.webp",
    },
    {
      name: "Garden Lawn",
      image: "/Villa_Retreats/Palatio/2-Spaces/Back_yard__.webp",
    },
    {
      name: "Villa Interior",
      image: "/Villa_Retreats/Palatio/2-Spaces/Living_Area.webp",
    },
    {
      name: "Traditional Spaces",
      image: "/Villa_Retreats/Palatio/2-Spaces/Walk_on_The_Water.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "indoors",
      title: "Villa Interiors",
      category: "Indoors",
      amenities: [
        "Traditional stone walls",
        "Spacious living area",
        "Air conditioning",
        "Inner courtyard view",
      ],
      images: [
        "/Villa_Retreats/Palatio/2-Spaces/Living_Area.webp",
        "/Villa_Retreats/Palatio/2-Spaces/Sky_lit_Inner_Court_Yard.webp",
        "/Villa_Retreats/Palatio/2-Spaces/Dining_Area.webp",
      ],
    },
    {
      id: "outdoors",
      title: "Garden & Pool",
      category: "Outdoors",
      amenities: [
        "Private stone pool",
        "Landscaped lawn",
        "Outdoor sit-out",
        "Backyard space",
      ],
      images: [
        "/Villa_Retreats/Palatio/2-Spaces/Private_Pool.webp",
        "/Villa_Retreats/Palatio/2-Spaces/Back_Yard.webp",
        "/Villa_Retreats/Palatio/2-Spaces/Out_Door_sitout.webp",
      ],
    },
    {
      id: "bed-bath",
      title: "Bedrooms",
      category: "Bed & Bath",
      amenities: [
        "King sized beds",
        "En-suite bathrooms",
        "Wardrobes",
        "Garden views",
      ],
      images: [
        "/Villa_Retreats/Palatio/2-Spaces/Bed_Room_1.webp",
        "/Villa_Retreats/Palatio/2-Spaces/Bed_Room_2.webp",
      ],
    },
  ],

  locationDetails: {
    mapImage: "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
    address: "Palatio, Harohalli, Near Art of Living, Bangalore — 562112",
    distance: "Approximately 50 minutes from Bangalore City Center",
    nearby: [
      { label: "ART OF LIVING", distance: "15 mins away" },
      { label: "PYRAMID VALLEY", distance: "Nearby" },
      { label: "KANAKAPURA ROAD", distance: "10 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=NCbxtU_uGhs",
    thumbnail: "/Villa_Retreats/Palatio/1-Hero/Hero 1.webp",
    duration: "2:25",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 15 guests can be accommodated.",
    },
    {
      question: "What is the event capacity?",
      answer: "Yes, it supports gatherings of up to 50-60 guests.",
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

export const palatio = {
  ...palatioBase,
  amenityHighlights: amenityHighlightsFrom(palatioBase.amenities),
};
