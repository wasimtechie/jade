import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const vannaniPerfectForLegacy = [
    "Group Getaways",
    "Nature Retreats",
    "Family Gatherings",
    "Private Celebrations",
    "Staycations",
  ];

const vannaniBase = {
  id: "vannani",
  hideFromVillasDirectory: true,
  name: "Vannani",
  type: "PRIVATE FARMHOUSE RETREAT",
  location: "Outskirts of Bangalore",
  stats: {
    stay: "15 Guests",
    events: "40 Guests",
    bhk: "3 BHK",
    lawn: "Private Lawn",
    villaArea: "Farm Estate",
  },
  description:
    "Vannani is a private farmhouse retreat designed for group stays and intimate events. The 3-bedroom property combines traditional farmhouse architecture with modern comforts, set within a private estate surrounded by greenery. With a private pool, outdoor seating areas, and dedicated event spaces, it offers a relaxed countryside experience accessible from Bangalore.",
  categories: ["Nature Retreats", "Weekend Getaways", "Pet Friendly"],
  thumbnail: "",
  image: "",
  images: ["", "", "", "", "", ""],
  amenities: [
    {
      label: "Private Pool",
      icon: "Waves",
      description:
        "A private swimming pool within the farmhouse estate for exclusive guest use.",
    },
    {
      label: "Air-conditioned Interiors",
      icon: "Wind",
      description:
        "All bedrooms and living areas are fully climate-controlled.",
    },
    {
      label: "Outdoor Seating",
      icon: "Sun",
      description: "Multiple outdoor seating zones across the lawn and garden.",
    },
    {
      label: "Jacuzzi",
      icon: "Waves",
      description: "On-site jacuzzi available for guest relaxation.",
    },
    {
      label: "Entertainment Systems",
      icon: "Music",
      description:
        "Audio-visual systems for group entertainment and gatherings.",
    },
    {
      label: "Bonfire Setup",
      icon: "Flame",
      description: "Dedicated bonfire zone for evening social sessions.",
    },
    {
      label: "Barbecue Setup",
      icon: "Utensils",
      description: "BBQ equipment for outdoor dining experiences.",
    },
    {
      label: "Fully Functional Kitchen",
      icon: "Kitchen",
      description: "Equipped kitchen for guest use or professional catering.",
    },
  ],
  propertyDetails: [
    {
      label: "3-Bedroom Farmhouse",
      description:
        "Traditional farmhouse design with modern amenities for comfortable group stays.",
      icon: "Bed",
    },
    {
      label: "Private Estate",
      description:
        "The entire property is booked exclusively, ensuring absolute privacy for your group.",
      icon: "Home",
    },
    {
      label: "Countryside Setting",
      description:
        "Surrounded by greenery and open spaces for a complete rural escape.",
      icon: "Trees",
    },
    {
      label: "Private Pool",
      description:
        "A welcome addition to the farmhouse experience for leisure and relaxation.",
      icon: "Waves",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef for curated farm-style meals and event catering.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support for a seamless hospitality experience.",
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
      description: "Assistance with decor and event arrangements.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    { title: "Farmhouse Living", image: "" },
    { title: "Poolside Sessions", image: "" },
    { title: "Bonfire Nights", image: "" },
    { title: "Nature Walks", image: "" },
  ],
  spaces: [
    { name: "Pool Area", image: "" },
    { name: "Main Living", image: "" },
    { name: "Garden Lawn", image: "" },
    { name: "Farmhouse Interior", image: "" },
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
    address: "Vannani, Outskirts of Bangalore, Karnataka",
    distance: "Approximately 60 minutes from Bangalore City Center",
    nearby: [{ label: "NEARBY ATTRACTIONS", distance: "Within 30 mins" }],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=WU-4wS3jx3E",
    thumbnail: "",
    duration: "2:55",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer:
        "Vannani accommodates up to 15 guests across its 3 bedrooms and shared areas.",
    },
    {
      question: "Can we host events here?",
      answer:
        "Yes, the property supports gatherings of up to 40 guests with outdoor lawn and event space.",
    },
    {
      question: "Is the pool private?",
      answer: "Yes, the pool is exclusively for your group's use.",
    },
  ],
};

const vannaniPerfectFor = splitLegacyPerfectFor(
  vannaniPerfectForLegacy,
  (vannaniBase.images?.length ? vannaniBase.images : [vannaniBase.image].filter(Boolean)) as string[],
);

export const vannani = {
  ...vannaniBase,
  amenityHighlights: amenityHighlightsFrom(vannaniBase.amenities),
  perfectForTags: vannaniPerfectFor.perfectForTags,
  perfectForCards: vannaniPerfectFor.perfectForCards,
};
