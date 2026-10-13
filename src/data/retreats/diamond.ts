import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const diamondPerfectForCards = [
    {
      title: "Events & Celebrations",
      image: "/Villa_Retreats/Diamond/4-Perfect For/Events & Celebrations.webp",
    },
    {
      title: "Grand Weddings",
      image: "/Villa_Retreats/Diamond/4-Perfect For/Grand Weddings.webp",
    },
    {
      title: "Group Getaways",
      image: "/Villa_Retreats/Diamond/4-Perfect For/Group Getaways.webp",
    },
    {
      title: "Weekend Getaways",
      image: "/Villa_Retreats/Diamond/4-Perfect For/Weekend Getaways.webp",
    },
  ];

const diamondBase = {
  id: "diamond",
  name: "Diamond Pavilion",
  type: "9-BEDROOM EVENT ESTATE",
  location: "Kanakapura Road · 10 min Art of Living",
  stats: {
    stay: "Up to 20 Guests (70 dorm max)",
    events: "200–400 seated · 2,000 floating",
    bhk: "9 BR + dormitory",
    lawn: "1 acre event lawn",
    villaArea: "10,000 sq.ft · infinity pool",
  },
  description:
    "Diamond by Jade is a large-scale private event venue set across a 3-acre property surrounded by coconut groves. Designed for weddings, corporate events, and large gatherings, it combines expansive outdoor spaces with structured indoor facilities.\n\nWith a 50,000 sq ft lawn, banquet hall, multiple accommodation blocks, and event-ready infrastructure, the property supports both high-capacity events and group stays. The layout enables simultaneous setups across zones.",
  perfectForCards: diamondPerfectForCards,
  perfectForTags: perfectForTagsFromCards(diamondPerfectForCards),
  categories: ["Weddings", "Corporate Retreats", "Party Venues", "Pre-wedding"],
  image: "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
  images: [
    "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
    "/Villa_Retreats/Diamond/Hero/Hero 2.webp",
    "/Villa_Retreats/Diamond/Hero/Hero 3.webp",
    "/Villa_Retreats/Diamond/Hero/Hero 4.webp",
    "/Villa_Retreats/Diamond/Spaces/Private Pool.webp",
    "/Villa_Retreats/Diamond/Spaces/Pool Area With Loungers.webp",
    "/Villa_Retreats/Diamond/Spaces/Gazebo - Lower Deck.webp",
    "/Villa_Retreats/Diamond/Spaces/Two Deck Gazebo.webp",
    "/Villa_Retreats/Diamond/Spaces/Semi Open Hall.webp",
    "/Villa_Retreats/Diamond/Spaces/Semi Open Dining Hall.webp",
    "/Villa_Retreats/Diamond/Spaces/Multipurpose Hall.webp",
    "/Villa_Retreats/Diamond/Spaces/Lounge Area.webp",
    "/Villa_Retreats/Diamond/Spaces/Lounger Sofa.webp",
    "/Villa_Retreats/Diamond/Spaces/Entertainment & Lounge Area.webp",
    "/Villa_Retreats/Diamond/Spaces/75 inch Smart Tv .webp",
    "/Villa_Retreats/Diamond/Spaces/Nine bedroom Villa.webp",
    "/Villa_Retreats/Diamond/Spaces/double Occupancy Room.webp",
    "/Villa_Retreats/Diamond/Spaces/Triple Occupancy Room.webp",
    "/Villa_Retreats/Diamond/Spaces/Quadruple Occupancy Room.webp",
    "/Villa_Retreats/Diamond/Spaces/The Stage.webp",
    "/Villa_Retreats/Diamond/Spaces/Snooker Table.webp",
    "/Villa_Retreats/Diamond/Spaces/Table Tennis Table.webp",
    "/Villa_Retreats/Diamond/Spaces/Carrom Board.webp",
    "/Villa_Retreats/Diamond/Spaces/Foosball Table.webp",
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
      name: "Private Pool",
      image: "/Villa_Retreats/Diamond/Spaces/Private Pool.webp",
    },
    {
      name: "Lounge Area",
      image: "/Villa_Retreats/Diamond/Spaces/Lounge Area.webp",
    },
    {
      name: "Modern Suites",
      image: "/Villa_Retreats/Diamond/Spaces/Quadruple Occupancy Room.webp",
    },
    {
      name: "Villa Exterior",
      image: "/Villa_Retreats/Diamond/Spaces/Nine bedroom Villa.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "exteriors-grand-entrance",
      title: "Exteriors & Grand Entrance",
      category: "Outdoors",
      amenities: ["Grand entry foyer", "Property facade", "Peripheral views"],
      images: [
        "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
        "/Villa_Retreats/Diamond/Spaces/Nine bedroom Villa.webp",
        "/Villa_Retreats/Diamond/Hero/Hero 2.webp",
      ],
    },
    {
      id: "expansive-lawns-pool",
      title: "Expansive Lawns & Pool",
      category: "Outdoors",
      amenities: [
        "50,000 sqft lawn",
        "Private pool access",
        "Pool deck loungers",
      ],
      images: [
        "/Villa_Retreats/Diamond/Spaces/Pool Area With Loungers.webp",
        "/Villa_Retreats/Diamond/Spaces/Private Pool.webp",
        "/Villa_Retreats/Diamond/Hero/Hero 3.webp",
      ],
    },
    {
      id: "banquets-event-spaces",
      title: "Banquets & Event Spaces",
      category: "Indoors",
      amenities: [
        "Semi-open banquet hall",
        "The Stage setup",
        "Multipurpose hall",
      ],
      images: [
        "/Villa_Retreats/Diamond/Spaces/Semi Open Hall.webp",
        "/Villa_Retreats/Diamond/Spaces/Semi Open Dining Hall.webp",
        "/Villa_Retreats/Diamond/Spaces/Multipurpose Hall.webp",
        "/Villa_Retreats/Diamond/Spaces/The Stage.webp",
      ],
    },
    {
      id: "luxury-suites-rooms",
      title: "Luxury Suites & Rooms",
      category: "Indoors",
      amenities: [
        "Double occupancy",
        "Triple occupancy",
        "Quadruple occupancy",
      ],
      images: [
        "/Villa_Retreats/Diamond/Spaces/double Occupancy Room.webp",
        "/Villa_Retreats/Diamond/Spaces/Triple Occupancy Room.webp",
        "/Villa_Retreats/Diamond/Spaces/Quadruple Occupancy Room.webp",
      ],
    },
    {
      id: "lounges-recreation",
      title: "Lounges & Recreation",
      category: "Indoors",
      amenities: ["Entertainment systems", "Smart TV lounge", "Plush seating"],
      images: [
        "/Villa_Retreats/Diamond/Spaces/Lounge Area.webp",
        "/Villa_Retreats/Diamond/Spaces/Lounger Sofa.webp",
        "/Villa_Retreats/Diamond/Spaces/Entertainment & Lounge Area.webp",
        "/Villa_Retreats/Diamond/Spaces/75 inch Smart Tv .webp",
      ],
    },
    {
      id: "outdoor-sit-outs",
      title: "Outdoor Sit-outs",
      category: "Outdoors",
      amenities: ["Two-deck gazebo", "Lower deck seating", "Garden sit-out"],
      images: [
        "/Villa_Retreats/Diamond/Spaces/Two Deck Gazebo.webp",
        "/Villa_Retreats/Diamond/Spaces/Gazebo - Lower Deck.webp",
        "/Villa_Retreats/Diamond/Hero/Hero 4.webp",
      ],
    },
    {
      id: "indoor-games-room",
      title: "Indoor Games Room",
      category: "Indoors",
      amenities: ["Snooker table", "Table tennis", "Carrom & Foosball"],
      images: [
        "/Villa_Retreats/Diamond/Spaces/Snooker Table.webp",
        "/Villa_Retreats/Diamond/Spaces/Table Tennis Table.webp",
        "/Villa_Retreats/Diamond/Spaces/Carrom Board.webp",
        "/Villa_Retreats/Diamond/Spaces/Foosball Table.webp",
      ],
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
      label: "9-Bedroom Accommodation",
      description:
        "Includes double, triple, and quad occupancy rooms for up to 40-50 guests.",
      icon: "Bed",
    },
    {
      label: "3-Acre Private Venue",
      description: "Large-scale property designed for events and group stays.",
      icon: "Map",
    },
    {
      label: "50,000 Sq Ft Lawn",
      description: "Expansive lawn supporting large gatherings and setups.",
      icon: "Trees",
    },
    {
      label: "Semi-open Banquet Hall",
      description: "Dining setup for up to 200 guests.",
      icon: "Home",
    },
    {
      label: "Multi-purpose Hall",
      description:
        "Convertible space for conferences or dorm-style accommodation.",
      icon: "Building",
    },
    {
      label: "Two-deck Gazebo",
      description: "Overlooking the pool and lawn for event setups.",
      icon: "Tent",
    },
    {
      label: "High-Capacity Parking",
      description: "Parking available for over 150 vehicles.",
      icon: "Car",
    },
  ],

  locationDetails: {
    mapImage: "",
    address: "Gudibanda road, Varlakonda, Chikkaballapur, Karnataka 562104",
    distance:
      "Located within Leela Apartments with direct access to retail, dining, and entertainment",
    nearby: [
      { label: "BHARTIYA MALL", distance: "Walking distance" },
      { label: "LEELA HOTEL", distance: "Within premises" },
      { label: "PVR CINEMAS", distance: "Walking distance" },
      { label: "BREWERIES & RESTAURANTS", distance: "Within complex" },
    ],
  },
  activities: [
    {
      title: "BBQ",
      image: "/Villa_Retreats/Diamond/3-Experiences/bbq.webp",
    },
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Diamond/3-Experiences/Bonfire.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Diamond/3-Experiences/floatinbf.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Diamond/3-Experiences/High Tea.webp",
    },
    {
      title: "Indoor & Outdoor Games",
      image:
        "/Villa_Retreats/Diamond/3-Experiences/Indoor & Outdoor Games.webp",
    },
    {
      title: "Movie Under The Stars",
      image: "/Villa_Retreats/Diamond/3-Experiences/Movie Under The Stars.webp",
    },
  ],
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=t-VX-VDkXj4",
    thumbnail: "/Villa_Retreats/Diamond/Hero/Hero 2.webp",
    duration: "1:41",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 40-50 guests can be accommodated.",
    },
    {
      question: "What is the event capacity?",
      answer: "The venue can host up to 1000-1500 guests depending on setup.",
    },
    {
      question: "Is catering included?",
      answer: "Catering can be arranged separately based on requirements.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, parking for over 150 vehicles is available.",
    },
    {
      question: "Can the venue host corporate events?",
      answer: "Yes, suitable for conferences, offsites, and large gatherings.",
    },
  ],
};

export const diamond = {
  ...diamondBase,
  amenityHighlights: amenityHighlightsFrom(diamondBase.amenities),
};
