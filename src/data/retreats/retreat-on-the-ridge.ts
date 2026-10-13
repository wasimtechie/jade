import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const retreat_on_the_ridgePerfectForCards = [
    {
      title: "Hillside Getaways",
      image:
        "/Villa_Retreats/Retreat on the ridge/4-Perfect for/Hillside Getaways.webp",
    },
    {
      title: "Personal Celebrations",
      image:
        "/Villa_Retreats/Retreat on the ridge/4-Perfect for/Personal Celebrations.webp",
    },
    {
      title: "Staycations",
      image:
        "/Villa_Retreats/Retreat on the ridge/4-Perfect for/Staycations.webp",
    },
    {
      title: "Weekend Getaways",
      image:
        "/Villa_Retreats/Retreat on the ridge/4-Perfect for/Weekend Getaways.webp",
    },
  ];

const retreatOnTheRidgeBase = {
  id: "retreat-on-the-ridge",
  name: "Retreat on the Ridge",
  type: "4-BEDROOM HILLSIDE VILLA",
  location: "Near Varalakonda Hill · Nandi Hills",
  stats: {
    stay: "Up to 10 Guests (18 max)",
    events: "Up to 40 Guests",
    bhk: "4 BHK",
    lawn: "2,990 sq.ft Lawn",
    villaArea: "Hilltop · pool + waterfall",
  },
  description:
    "Retreat on the Ridge is a private hillside villa designed for small group stays with open views and outdoor-focused living. The 4-bedroom layout combines indoor comfort with elevated natural surroundings, making it suitable for getaways and small gatherings. With a private pool, lawn spaces, and ridge-facing views, the property offers a quiet setting close to Nandi Hills while maintaining privacy.",
  perfectForCards: retreat_on_the_ridgePerfectForCards,
  perfectForTags: perfectForTagsFromCards(retreat_on_the_ridgePerfectForCards),
  categories: ["Nature Retreats", "Weekend Getaways", "Pre-wedding"],
  thumbnail: "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
  image: "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
  images: [
    "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Villa.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Private Pool.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Hill View.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Living Area.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Bedroom 1.webp",
    "/Villa_Retreats/Retreat on the ridge/2-Spaces/Dining Area.webp",
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
      description:
        "Spacious layout designed for group stays and shared living.",
      icon: "Bed",
    },
    {
      label: "Hill-facing Property",
      description: "Located along a ridge with open valley views.",
      icon: "Mountain",
    },
    {
      label: "Private Pool with Waterfall",
      description: "Pool with cascading waterfall and deck-side access.",
      icon: "Waves",
    },
    {
      label: "Lawn & Outdoor Zones",
      description: "Dedicated lawn space for gatherings and activities.",
      icon: "Trees",
    },
    {
      label: "Gazebo Seating Area",
      description: "Outdoor shaded sit-out for small groups.",
      icon: "Tent",
    },
    {
      label: "Indoor Lounge Space",
      description: "Common area designed for relaxation and entertainment.",
      icon: "Sofa",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description: "Private chef for curated hillside dining and group meals.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description: "On-site service support for seamless hospitality.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description: "Transport support available for guest logistics.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with decor and arrangements for small gatherings.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Retreat on the ridge/3-Experiences_/Bonfire.webp",
    },
    {
      title: "Floating Breakfast",
      image:
        "/Villa_Retreats/Retreat on the ridge/3-Experiences_/Floating breakfast.webp",
    },
    {
      title: "High Tea",
      image:
        "/Villa_Retreats/Retreat on the ridge/3-Experiences_/High Tea.webp",
    },
    {
      title: "Movie Under The Stars",
      image:
        "/Villa_Retreats/Retreat on the ridge/3-Experiences_/Movie under the stars.webp",
    },
    {
      title: "BBQ",
      image: "/Villa_Retreats/Retreat on the ridge/3-Experiences_/bbq.webp",
    },
  ],
  spaces: [
    {
      name: "Ridge View Pool",
      image:
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Pool Area - Day.webp",
    },
    {
      name: "Poolside Lawn",
      image: "/Villa_Retreats/Retreat on the ridge/2-Spaces/Poolside Lawn.webp",
    },
    {
      name: "Living Area",
      image: "/Villa_Retreats/Retreat on the ridge/2-Spaces/Living Area.webp",
    },
    {
      name: "Lawn Gazebo",
      image: "/Villa_Retreats/Retreat on the ridge/2-Spaces/Gazebo.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "indoors",
      title: "Villa Interiors",
      category: "Indoors",
      amenities: [
        "Spacious living room",
        "Dining area",
        "Air conditioning",
        "Entertainment setup",
      ],
      images: [
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Living Area.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Dining Area.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Living & Dining Area.webp",
      ],
    },
    {
      id: "outdoors",
      title: "Garden & Pool",
      category: "Outdoors",
      amenities: [
        "Private swimming pool",
        "Poolside gazebo",
        "Outdoor lawn",
        "Hill views",
      ],
      images: [
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Private Pool.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Hill View.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Gazebo.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Poolside Lawn.webp",
      ],
    },
    {
      id: "bed-bath",
      title: "Bedrooms",
      category: "Bed & Bath",
      amenities: [
        "King beds",
        "En-suite bathrooms",
        "Wardrobes",
        "Air conditioning",
      ],
      images: [
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Bedroom 1.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Bedroom2.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Bedroom 3.webp",
        "/Villa_Retreats/Retreat on the ridge/2-Spaces/Bedroom 4.webp",
      ],
    },
  ],

  locationDetails: {
    mapImage: "",
    address: "Near Nandi Hills, Chikkaballapur, Karnataka — 562101",
    distance: "Approximately 90 minutes from Bangalore City Center",
    nearby: [
      { label: "NANDI HILLS", distance: "15 mins away" },
      { label: "SKANDAGIRI", distance: "25 mins away" },
      { label: "BHOGA NANDEESHWARA TEMPLE", distance: "10 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=SiQ_0LH1MDk",
    thumbnail: "/Villa_Retreats/Retreat on the ridge/1-Hero/Hero.webp",
    duration: "1:25",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 12 guests can be accommodated.",
    },
    {
      question: "What is the event capacity?",
      answer: "Suitable for small gatherings up to 20 guests.",
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

export const retreatOnTheRidge = {
  ...retreatOnTheRidgeBase,
  amenityHighlights: amenityHighlightsFrom(retreatOnTheRidgeBase.amenities),
};
