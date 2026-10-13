import { amenityHighlightsFrom, perfectForTagsFromCards, splitLegacyPerfectFor } from "@/lib/villaDetailData";

const jade_735PerfectForCards = [
    {
      title: "Boutique Stays",
      image: "/Villa_Retreats/Jade 735/4-Perfect for/Boutique Stays.webp",
    },
    {
      title: "Family Gatherings",
      image: "/Villa_Retreats/Jade 735/4-Perfect for/Family Gatherings.webp",
    },
    {
      title: "Social Stays",
      image: "/Villa_Retreats/Jade 735/4-Perfect for/Social Stays.webp",
    },
    {
      title: "Staycations",
      image: "/Villa_Retreats/Jade 735/4-Perfect for/Staycations.webp",
    },
  ];

const jade735Base = {
  id: "jade-735",
  name: "Jade 735",
  type: "4-BEDROOM BALINESE VILLA",
  location: "Sadahalli · 5 min Airport Toll",
  stats: {
    stay: "Up to 10 Guests (family only)",
    events: "Not available",
    bhk: "4 BHK",
    lawn: "Small lawn",
    villaArea: "5,000 sq.ft · rooftop jacuzzi",
  },
  description:
    "Jade 735 is a private boutique villa designed as a personal retreat within a resort-like setting. The 4+1 bedroom layout combines curated interiors with multiple experiential zones, creating a space suited for both stays and hosted gatherings. With a private pool featuring a 10 ft waterfall, jacuzzi lounge, gazebo seating, and multiple indoor-outdoor zones, the property offers a layered experience across spaces. Designed for privacy, it supports celebrations, retreats, and social stays within a controlled environment.",
  perfectForCards: jade_735PerfectForCards,
  perfectForTags: perfectForTagsFromCards(jade_735PerfectForCards),
  categories: ["Luxury Stays", "Weekend Getaways", "Corporate Retreats"],
  thumbnail: "/Villa_Retreats/Jade%20735/Hero/Hero 1.webp",
  image: "/Villa_Retreats/Jade%20735/Hero/Hero 1.webp",
  images: [
    "/Villa_Retreats/Jade%20735/Hero/Hero 1.webp",
    "/Villa_Retreats/Jade%20735/Spaces/Pool_day_View.webp",
    "/Villa_Retreats/Jade%20735/Spaces/10ft_waterFall+Pool.webp",
    "/Villa_Retreats/Jade%20735/Spaces/Living_room_.webp",
    "/Villa_Retreats/Jade%20735/Spaces/Master_Bed_Room.webp",
    "/Villa_Retreats/Jade%20735/Spaces/Bar_Counter.webp",
    "/Villa_Retreats/Jade%20735/Spaces/Dining_Area.webp",
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
      label: "4+1 Bedroom Private Villa",
      description:
        "A boutique villa layout designed for group stays and social experiences.",
      icon: "Bed",
    },
    {
      label: "Private Pool with Waterfall",
      description: "Features a swimming pool with a 10 ft cascading waterfall.",
      icon: "Waves",
    },
    {
      label: "Jacuzzi Lounge",
      description: "6-seater jacuzzi available on request at additional cost.",
      icon: "Bath",
    },
    {
      label: "Piscean Corridor Lounge",
      description:
        "Indoor lounge space designed for relaxation and social use.",
      icon: "Sofa",
    },
    {
      label: "Exclusive Private Property",
      description: "Standalone property ensuring privacy for stays and events.",
      icon: "Lock",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef service available to craft personalized menus for stays and celebrations.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "On-site service support to ensure every guest need is met with professional hospitality.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Pick-up & Drop",
      description:
        "Transport assistance for guest arrival and departure, particularly convenient for airport transfers.",
      footer: "Confirmed during booking",
      icon: "Car",
    },
    {
      title: "Event Setup Support",
      description:
        "Assistance with personalized decor and technical production for intimate events.",
      footer: "Available on request",
      icon: "PartyPopper",
    },
  ],
  activities: [
    {
      title: "Bonfire",
      image: "/Villa_Retreats/Jade 735/3-Experience/Bonfire.webp",
    },
    {
      title: "Floating Breakfast",
      image: "/Villa_Retreats/Jade 735/3-Experience/Floating breakfast.webp",
    },
    {
      title: "Submerged Dining",
      image: "/Villa_Retreats/Jade 735/3-Experience/Submerged Dining.webp",
    },
    {
      title: "BBQ",
      image: "/Villa_Retreats/Jade 735/3-Experience/bbq.webp",
    },
    {
      title: "Candlelit Dining",
      image: "/Villa_Retreats/Jade 735/3-Experience/candlelit Dining.webp",
    },
    {
      title: "High Tea",
      image: "/Villa_Retreats/Jade 735/3-Experience/highh tea.jpg.webp",
    },
  ],
  spaces: [
    {
      name: "Waterfall Pool",
      image: "/Villa_Retreats/Jade 735/Spaces/10ft_waterFall+Pool.webp",
    },
    {
      name: "Gazebo Lounge",
      image: "/Villa_Retreats/Jade 735/Spaces/Pool_side_Gazibo.webp",
    },
    {
      name: "Jacuzzi Area",
      image: "/Villa_Retreats/Jade 735/Spaces/Pool_Side_Bar_Area.webp",
    },
    {
      name: "Master Suite",
      image: "/Villa_Retreats/Jade 735/Spaces/Master_Bed_Room.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "gazebo-lounge",
      title: "Gazebo Lounge",
      category: "Outdoors",
      amenities: [
        "Comfortable seating",
        "Ambient lighting",
        "Open-air setting",
        "Private gazebo",
      ],
      images: [
        "/Villa_Retreats/Jade 735/Spaces/Pool_side_Gazibo.webp",
        "/Villa_Retreats/Jade 735/Spaces/Pool_Side_Bar_Area.webp",
      ],
    },
    {
      id: "luxury-suites",
      title: "Luxury Suites",
      category: "Bed & Bath",
      amenities: [
        "King bed",
        "Air conditioning",
        "Room-darkening blinds",
        "Wardrobe",
        "En-suite bathroom",
      ],
      images: [
        "/Villa_Retreats/Jade 735/Spaces/Master_Bed_Room.webp",
        "/Villa_Retreats/Jade 735/Spaces/Bed_Room_1.webp",
        "/Villa_Retreats/Jade 735/Spaces/Bed_Room_2.webp",
        "/Villa_Retreats/Jade 735/Spaces/Bed_Room_3.webp",
      ],
    },
    {
      id: "living-dining",
      title: "Living & Dining",
      category: "Indoors",
      amenities: [
        "Spacious living room",
        "Dining hall",
        "Fully equipped kitchen",
      ],
      images: [
        "/Villa_Retreats/Jade 735/Spaces/Living_room_.webp",
        "/Villa_Retreats/Jade 735/Spaces/Dining_Area.webp",
        "/Villa_Retreats/Jade 735/Spaces/Dining&Kitchen_Area.webp",
      ],
    },
  ],

  locationDetails: {
    mapImage: "",
    address: "735, Jade Garden Phase II, Sadahalli, Bangalore — 562110",
    distance: "Approximately 20 minutes from Airport",
    nearby: [
      { label: "CLUB KABANA", distance: "Next to property" },
      { label: "AIRPORT", distance: "20 mins away" },
      { label: "HIGHWAY", distance: "5 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=tDHkITeT3HU",
    thumbnail: "/Villa_Retreats/Jade 735/Hero/hero.webp",
    duration: "5:44",
  },
  faq: [
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 20 guests can be accommodated.",
    },
    {
      question: "Is the property suitable for events?",
      answer:
        "Yes, suitable for small to mid-sized social gatherings and celebrations.",
    },
    {
      question: "Is the jacuzzi included?",
      answer: "Available at an additional cost on request.",
    },
    {
      question: "Are meals included?",
      answer: "Meals are not included and can be arranged separately.",
    },
    {
      question: "Is decoration allowed?",
      answer: "Yes, personalised decor can be arranged on request.",
    },
  ],
};

export const jade735 = {
  ...jade735Base,
  amenityHighlights: amenityHighlightsFrom(jade735Base.amenities),
};
