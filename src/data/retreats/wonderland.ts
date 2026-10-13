import { amenityHighlightsFrom } from "@/lib/villaDetailData";

const wonderlandPerfectForCards = [
    {
      title: "Family Getaways",
      image: "/Villa_Retreats/Wonderland/Perfect For/Family Getaways.webp",
    },
    {
      title: "Nature Stays",
      image: "/Villa_Retreats/Wonderland/Perfect For/Nature Stays.webp",
    },
    {
      title: "Staycations",
      image: "/Villa_Retreats/Wonderland/Perfect For/Staycations.webp",
    },
    {
      title: "Weekend Getaways",
      image: "/Villa_Retreats/Wonderland/Perfect For/Weekend Getaways.webp",
    },
  ];

const wonderlandBase = {
  id: "wonderland",
  name: "Wonderland",
  type: "TREEHOUSE NATURE RETREAT",
  location: "Hosur, Near Bangalore",
  stats: {
    stay: "Up to 4 Guests (6 max)",
    events: "Up to 15 Guests",
    bhk: "2 BHK",
    pool: "Natural Rock Pool",
  },
  description:
    "Wonderland is a 2-bedroom treehouse villa designed for intimate stays surrounded by greenery. Built as an elevated living space, it offers a nature-led experience with open views and outdoor-focused living. With a party deck, outdoor dining under the treehouse, and access to a natural freshwater pool, the property is suited for small groups, quiet getaways, and private celebrations.",
  perfectForCards: wonderlandPerfectForCards,
  perfectForTags: ["Weekend Getaways", "Couple Retreats"],
  categories: ["Pet Friendly", "Weekend Getaways", "Nature Retreats"],
  image: "/Villa_Retreats/Wonderland/Hero/hero.webp",
  images: [
    "/Villa_Retreats/Wonderland/Hero/hero.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero_2.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 3.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 4.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 5.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 6.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero 7.webp",
    "/Villa_Retreats/Wonderland/Hero/Hero__.webp",
    "/Villa_Retreats/Wonderland/Spaces/Common_Fresh_water_Pool.webp",
    "/Villa_Retreats/Wonderland/Spaces/Bed_Room_1.webp",
    "/Villa_Retreats/Wonderland/Spaces/Dining.webp",
    "/Villa_Retreats/Wonderland/Spaces/6_Seater_Jacuzzi.webp",
    "/Villa_Retreats/Wonderland/Spaces/Party_Deck.webp",
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
  spaces: [
    {
      name: "Treehouse Deck",
      image: "/Villa_Retreats/Wonderland/Hero/hero.webp",
    },
    {
      name: "Living Area",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_01.webp",
    },
    {
      name: "Garden",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_02.webp",
    },
    {
      name: "Courtyard",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_03.webp",
    },
    {
      name: "Rock Pool",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_04.webp",
    },
    {
      name: "Party Deck",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_05.webp",
    },
    {
      name: "Dining Area",
      image: "/Villa_Retreats/Wonderland/Spaces/spaces_06.webp",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description: "A private chef can be arranged for curated meals.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support can be arranged for events or hosted stays.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description: "Transport support available on request.",
      footer: "Service scope to be confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description: "Assistance with personalised decor and event arrangements.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  propertyDetails: [
    {
      label: "2-Bedroom Treehouse Villa",
      description: "Designed for intimate stays with elevated living spaces.",
      icon: "Bed",
    },
    {
      label: "Nature-led Setting",
      description: "Surrounded by greenery with open outdoor zones.",
      icon: "Trees",
    },
    {
      label: "Party Deck Space",
      description: "Dedicated deck suitable for small gatherings (up to 10).",
      icon: "Sun",
    },
    {
      label: "Outdoor Dining Under Treehouse",
      description: "Dining setup located beneath the elevated structure.",
      icon: "Utensils",
    },
    {
      label: "Natural Freshwater Pool Access",
      description: "Shared pool with rock-based filtration system.",
      icon: "Waves",
    },
    {
      label: "Pet-friendly Property",
      description: "Allows pets within the premises.",
      icon: "Heart",
    },
  ],

  locationDetails: {
    mapImage: "",
    address:
      "Survey no. 320/1A, Chinnapathirali Village, Shoolagiri, Tamil Nadu 635105",
    distance: "45 minutes from Sarjapur",
    nearby: [
      { label: "SHOOLAGIRI HILLS", distance: "15 mins away" },
      { label: "LOCAL LAKE VIEWPOINTS", distance: "15-20 mins away" },
      { label: "TREKKING TRAILS", distance: "Accessible nearby" },
      { label: "TEMPLE ROUTES", distance: "Accessible nearby" },
    ],
  },
  activities: [
    {
      title: "BBQ",
      image: "/Villa_Retreats/Wonderland/Experiences/bbq.webp",
    },
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Wonderland/Experiences/Bonfire.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Wonderland/Experiences/high tea.webp",
    },
    {
      title: "Horse Riding",
      image: "/Villa_Retreats/Wonderland/Experiences/Horse Riding.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "treehouse-deck",
      title: "Treehouse Deck",
      category: "Outdoors",
      amenities: ["Deck seating", "Nature views", "Party space"],
      images: [
        "/Villa_Retreats/Wonderland/Spaces/spaces_05.webp",
        "/Villa_Retreats/Wonderland/Spaces/spaces_06.webp",
      ],
    },
    {
      id: "living-area",
      title: "Living Area",
      category: "Indoors",
      amenities: ["Air conditioning", "Cozy seating", "Nature integration"],
      images: [
        "/Villa_Retreats/Wonderland/Spaces/spaces_07.webp",
        "/Villa_Retreats/Wonderland/Spaces/spaces_08.webp",
      ],
    },
    {
      id: "rock-pool",
      title: "Natural Rock Pool",
      category: "Outdoors",
      amenities: ["Freshwater pool", "Baby pool", "Jacuzzi jets"],
      images: [
        "/Villa_Retreats/Wonderland/Spaces/spaces_09.webp",
        "/Villa_Retreats/Wonderland/Spaces/spaces_10.webp",
      ],
    },
  ],
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=OWJ_8WU1-vQ",
    thumbnail: "/Villa_Retreats/Wonderland/Hero/hero.webp",
    duration: "2:14",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 4 guests can stay overnight (6 max).",
    },
    {
      question: "What is the event capacity?",
      answer: "Yes, suitable for small gatherings up to 15 guests.",
    },
    {
      question: "Is the pool private?",
      answer: "The pool is a shared natural freshwater pool.",
    },
    {
      question: "Are meals included?",
      answer: "Breakfast is included. Other meals can be arranged.",
    },
    {
      question: "Are pets allowed?",
      answer: "Yes, the property is pet-friendly.",
    },
  ],
};

export const wonderland = {
  ...wonderlandBase,
  amenityHighlights: amenityHighlightsFrom(wonderlandBase.amenities),
};
