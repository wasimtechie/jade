import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const royaltyPerfectForCards = [
    {
      title: "Equestrian Enthusiasts",
      image:
        "/Villa_Retreats/Royalty/4- Perfect For/Equestrian Enthusiasts.webp",
    },
    {
      title: "Family Reunions",
      image: "/Villa_Retreats/Royalty/4- Perfect For/Family Reunions.webp",
    },
    {
      title: "Premium Hill Stays",
      image: "/Villa_Retreats/Royalty/4- Perfect For/Premium Hill Stays.webp",
    },
    {
      title: "Staycations",
      image: "/Villa_Retreats/Royalty/4- Perfect For/Staycations.webp",
    },
  ];

const royaltyBase = {
  id: "royalty",
  bookable: false,
  name: "Royalty",
  type: "EQUESTRIAN HILL VIEW RETREAT",
  location: "Chikkaballapur",
  stats: {
    stay: "15 Guests",
    events: "30 Guests",
    bhk: "5 BHK",
    lawn: "Equestrian Arena",
    villaArea: "Hilltop Glasshouse",
  },
  description:
    "Royalty by Jade is a private equestrian villa set against the Varlakonda hills, designed for stays and small-format gatherings. The 5-bedroom glasshouse villa combines indoor living with expansive outdoor spaces and uninterrupted hill views. With a private pool, riding arena, horse stable, and landscaped lawn, the property offers a mix of relaxation and activity-led experiences. Built for privacy, it supports group stays, celebrations, and retreat-style experiences.",
  perfectForCards: royaltyPerfectForCards,
  perfectForTags: perfectForTagsFromCards(royaltyPerfectForCards),
  categories: [
    "Luxury Stays",
    "Weekend Getaways",
    "Nature Retreats",
    "Pre-wedding",
  ],
  thumbnail: "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
  image: "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
  images: [
    "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
    "/Villa_Retreats/Royalty/1-Hero/hero 2.webp",
    "/Villa_Retreats/Royalty/1-Hero/Hero 3.webp",
    "/Villa_Retreats/Royalty/2-Spaces/Villa Entrance.webp",
    "/Villa_Retreats/Royalty/2-Spaces/7 foot waterfall pool.webp",
    "/Villa_Retreats/Royalty/2-Spaces/Hill View.webp",
    "/Villa_Retreats/Royalty/2-Spaces/living room.webp",
    "/Villa_Retreats/Royalty/2-Spaces/Bedroom 1.webp",
    "/Villa_Retreats/Royalty/2-Spaces/Dining area.webp",
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
      label: "5-Bedroom Glasshouse Villa",
      description:
        "Spacious villa with attached bathrooms accommodating up to 15 guests.",
      icon: "Bed",
    },
    {
      label: "Private Pool with Waterfall",
      description: "Pool overlooking the lawn with scenic hill views.",
      icon: "Waves",
    },
    {
      label: "Equestrian Setup",
      description:
        "Includes a horse riding arena and stable housing three horses.",
      icon: "Activity",
    },
    {
      label: "Hill View Location",
      description: "Panoramic views of the Varlakonda hills from the property.",
      icon: "Mountain",
    },
    {
      label: "Pet-Friendly Property",
      description: "Allows pets within the premises.",
      icon: "Dog",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description: "Private chef for curated meals and event catering.",
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
      description: "Transport support available for guest transfers.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description: "Assistance with decor and arrangements for events.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "BBQ",
      image: "/Villa_Retreats/Royalty/3-Experiences/BBq.webp",
    },
    {
      title: "Candlelit Dining",
      image: "/Villa_Retreats/Royalty/3-Experiences/Candlelit dining.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Royalty/3-Experiences/High eta.webp",
    },
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Royalty/3-Experiences/bonfire.webp",
    },
    {
      title: "Horse Riding Safari",
      image:
        "/Villa_Retreats/Royalty/3-Experiences/experience_horse riding safari.webp",
    },
    {
      title: "Movie Under The Stars",
      image: "/Villa_Retreats/Royalty/3-Experiences/movie under the stars.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Royalty/3-Experiences/floatinbf.webp",
    },
  ],
  spaces: [
    {
      name: "Pool & Waterfall",
      image: "/Villa_Retreats/Royalty/2-Spaces/9.webp",
    },
    { name: "Riding Arena", image: "/Villa_Retreats/Royalty/2-Spaces/10.webp" },
    {
      name: "Glasshouse Living",
      image: "/Villa_Retreats/Royalty/2-Spaces/11.webp",
    },
    {
      name: "Hill View Terrace",
      image: "/Villa_Retreats/Royalty/2-Spaces/12.webp",
    },
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
      images: [
        "/Villa_Retreats/Royalty/2-Spaces/13.webp",
        "/Villa_Retreats/Royalty/2-Spaces/14.webp",
      ],
    },
  ],

  locationDetails: {
    mapImage: "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
    address: "Gudibanda road, Varlakonda, Chikkaballapur, Karnataka 562104",
    distance: "Approximately 75 minutes from Bangalore City Center",
    nearby: [
      { label: "GUDIBANDE LAKE", distance: "12 mins away" },
      { label: "NANDI HILLS", distance: "55 mins away" },
      { label: "SKANDAGIRI RANGE", distance: "40 mins away" },
      { label: "ISHA YOGA CENTRE", distance: "40 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=VlACTqexHoI",
    thumbnail: "/Villa_Retreats/Royalty/1-Hero/Hero 1.webp",
    duration: "1:53",
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

export const royalty = {
  ...royaltyBase,
  amenityHighlights: amenityHighlightsFrom(royaltyBase.amenities),
};
