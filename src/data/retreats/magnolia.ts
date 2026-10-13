import { amenityHighlightsFrom, perfectForTagsFromCards } from "@/lib/villaDetailData";

const magnoliaPerfectForCards = [
  {
    title: "Private Celebrations",
    image: "/Villa_Retreats/Magnolia/Perfect For/Private Celebrations.webp",
  },
  {
    title: "Weddings",
    image: "/Villa_Retreats/Magnolia/Perfect For/Weddings.webp",
  },
  {
    title: "Corporate Outings",
    image: "/Villa_Retreats/Magnolia/Perfect For/corporate outings.webp",
  },
  {
    title: "Staycations",
    image: "/Villa_Retreats/Magnolia/Perfect For/stayctions.webp",
  },
];

const magnoliaBase = {
  id: "magnolia",
  name: "Magnolia",
  type: "CONTEMPORARY GLASS HOUSE VILLA",
  location: "Kanakapura Road · Near Art of Living",
  stats: {
    stay: "Up to 12 Guests (40 max)",
    events: "50–500 Guests",
    bhk: "3 BR + family room",
    lawn: "21,000 sq.ft Lawn",
    villaArea: "4,800 sq.ft · 1 acre",
  },
  description:
    "Magnolia is a contemporary private villa designed for immersive stays and large-scale gatherings. This modern three-bedroom glass villa brings together luxury, scale, and ambience, making it ideal for weekend getaways, private parties, corporate outings, and wedding celebrations. Featuring a massive private pool, bar and lounge, personal home theatre, conference hall, and a basketball court, the property also includes a 25,000 sq. ft. landscaped lawn. Located 20 minutes from the Art of Living International Centre and opposite Pyramid Valley, it offers a rare balance of accessibility and complete privacy.",
  perfectForCards: magnoliaPerfectForCards,
  perfectForTags: perfectForTagsFromCards(magnoliaPerfectForCards),
  categories: [
    "Weddings",
    "Corporate Retreats",
    "Luxury Stays",
    "Party Venues",
    "Pre-wedding",
  ],
  thumbnail: "/Villa_Retreats/Magnolia/Hero/Hero 1.webp",
  image: "/Villa_Retreats/Magnolia/Hero/Hero 1.webp",
  images: [
    "/Villa_Retreats/Magnolia/Hero/Hero 1.webp",
    "/Villa_Retreats/Magnolia/Hero/Hero 2.webp",
    "/Villa_Retreats/Magnolia/Hero/Hero 3.webp",
    "/Villa_Retreats/Magnolia/Hero/Hero 4.webp",
    "/Villa_Retreats/Magnolia/Hero/Hero 5.webp",
    "/Villa_Retreats/Magnolia/Spaces/Villa.webp",
    "/Villa_Retreats/Magnolia/Spaces/Pool.webp",
    "/Villa_Retreats/Magnolia/Spaces/Living_Area.webp",
    "/Villa_Retreats/Magnolia/Spaces/Bed_Room_1.webp",
    "/Villa_Retreats/Magnolia/Spaces/Dining_Area.webp",
    "/Villa_Retreats/Magnolia/Spaces/Lawn_Area.webp",
    "/Villa_Retreats/Magnolia/Spaces/Private_Home_Theatre.webp",
  ],
  amenities: [
    {
      label: "Private Pool",
      icon: "Waves",
      description:
        "A massive private swimming pool featuring a dedicated bar, lounge setup, and patio seating for premium relaxation.",
    },
    {
      label: "Air-conditioned Interiors",
      icon: "Wind",
      description:
        "All bedrooms and indoor areas are fully air-conditioned for year-round comfort.",
    },
    {
      label: "Outdoor Seating",
      icon: "Sun",
      description:
        "Multiple outdoor lounge and seating arrangements across the lawn and poolside.",
    },
    {
      label: "Entertainment Systems",
      icon: "Music",
      description:
        "High-quality sound and entertainment systems for events and casual listening.",
    },
    {
      label: "Home Theatre",
      icon: "Projector",
      description:
        "A private 8-seater home theatre for immersive movies and group indoor entertainment.",
    },
    {
      label: "Bar Lounge",
      icon: "GlassWater",
      description:
        "An integrated bar-style lounge area perfect for hosting social cocktail evenings by the poolside.",
    },
    {
      label: "Multipurpose Hall",
      icon: "Presentation",
      description:
        "Flexible indoor hall that can be used as a conference space, workshop area, or additional guest accommodation.",
    },
    {
      label: "Dry Kitchen",
      icon: "Kitchen",
      description:
        "Modern dry kitchen equipped for light food preparation and professional event service.",
    },
  ],
  propertyDetails: [
    {
      label: "3-Bedroom Glass Villa",
      description:
        "Luxury bedrooms and large living areas designed to overlook the private pool and estate greenery.",
      icon: "Bed",
    },
    {
      label: "One-Acre Estate",
      description:
        "Total privacy across a one-acre property with meticulously maintained landscapes and multiple activity zones.",
      icon: "Sun",
    },
    {
      label: "7,000 sq. ft. Built-up",
      description:
        "Spacious villa layout providing ample room for 30 stay-in guests and premium group experiences.",
      icon: "Maximize",
    },
    {
      label: "South Bangalore Location",
      description:
        "Conveniently located near the Art of Living International Centre and opposite Pyramid Valley.",
      icon: "MapPin",
    },
  ],
  services: [
    {
      title: "Chef on Call",
      description:
        "Private chef service available for curated farm-to-table meals and specialized event catering.",
      footer: "Available on request. Additional charges apply",
      icon: "ChefHat",
    },
    {
      title: "Butler Service",
      description:
        "Professional on-site butler support to ensure a seamless and high-end guest experience.",
      footer: "Available on request. Additional charges apply",
      icon: "User",
    },
    {
      title: "Housekeeping",
      description:
        "Regular housekeeping services to maintain the villa and common areas during your stay.",
      footer: "Included in stay packages",
      icon: "SprayCan",
    },
    {
      title: "Concierge Assistance",
      description:
        "Dedicated assistance for planning local experiences and logistics during the retreat.",
      footer: "Available on request",
      icon: "Phone",
    },
  ],
  activities: [
    {
      title: "Bonfire",
      description: "Evening bonfire for gatherings under the stars.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/Bonfire.webp",
    },
    {
      title: "Floating Breakfast",
      description: "Breakfast served in the pool for a relaxed morning.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/Floating Breakfast.webp",
    },
    {
      title: "Gazebo By The Pool",
      description: "Shaded poolside gazebo for lounging and small celebrations.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/Gazebo By The Pool.webp",
    },
    {
      title: "High Tea",
      description: "Evening tea with light bites in a relaxed setting.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/High tea.webp",
    },
    {
      title: "Barbeque",
      description: "Outdoor grill setup for group dining and celebrations.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/barbeque.webp",
    },
    {
      title: "Candlelit Dining",
      description: "Private dining under warm ambient lighting.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/candlelit dining.webp",
    },
    {
      title: "Diamond",
      description: "Signature curated experience on the estate.",
      image: "/Villa_Retreats/Magnolia/3-Experiences/diamond.webp",
    },
  ],
  spaces: [
    {
      name: "Glass Living Room",
      image: "/Villa_Retreats/Magnolia/Spaces/Living_Area.webp",
    },
    {
      name: "Pool Deck",
      image: "/Villa_Retreats/Magnolia/Spaces/Pool.webp",
    },
    {
      name: "Main Lawn",
      image: "/Villa_Retreats/Magnolia/Spaces/Lawn_Area.webp",
    },
    {
      name: "Luxury Suite",
      image: "/Villa_Retreats/Magnolia/Spaces/Bed_Room_1.webp",
    },
  ],
  categorizedSpaces: [
    {
      id: "glass-living-room",
      title: "Glass Living Room",
      category: "Indoors",
      amenities: [
        "Lounge seating",
        "Air conditioning",
        "Natural lighting",
        "Garden views",
      ],
      images: [
        "/Villa_Retreats/Magnolia/Spaces/Living_Area.webp",
        "/Villa_Retreats/Magnolia/Spaces/Dining_Area.webp",
        "/Villa_Retreats/Magnolia/Spaces/Family_Room.webp",
      ],
    },
    {
      id: "pool-deck",
      title: "Pool Deck",
      category: "Outdoors",
      amenities: [
        "Private pool",
        "Poolside bar",
        "Sun loungers",
        "Outdoor shower",
      ],
      images: [
        "/Villa_Retreats/Magnolia/Spaces/Pool.webp",
        "/Villa_Retreats/Magnolia/Spaces/Bar_Lounge.webp",
        "/Villa_Retreats/Magnolia/Spaces/Pool_Side_SitOut_1.webp",
      ],
    },
    {
      id: "main-lawn",
      title: "Main Lawn",
      category: "Outdoors",
      amenities: [
        "Large lawn",
        "Basketball court",
        "Event space",
        "Outdoor seating",
      ],
      images: [
        "/Villa_Retreats/Magnolia/Spaces/Lawn_Area.webp",
        "/Villa_Retreats/Magnolia/Spaces/Basket_Ball_Court.webp",
        "/Villa_Retreats/Magnolia/Spaces/Pool_Side_SitOut_2.webp",
      ],
    },
    {
      id: "luxury-suites",
      title: "Luxury Suites",
      category: "Bed & Bath",
      amenities: [
        "King bed",
        "Air conditioning",
        "En-suite bathroom",
        "Walk-in wardrobe",
      ],
      images: [
        "/Villa_Retreats/Magnolia/Spaces/Bed_Room_1.webp",
        "/Villa_Retreats/Magnolia/Spaces/Bed_Room_2.webp",
        "/Villa_Retreats/Magnolia/Spaces/Bed_Room_3.webp",
      ],
    },
  ],
  locationDetails: {
    mapImage: "",
    address:
      "Magnolia, Harohalli (Opposite Pyramid Valley), Bangalore — 562112",
    distance: "Approximately 45 minutes from Bangalore City Center",
    nearby: [
      { label: "ART OF LIVING", distance: "20 mins away" },
      { label: "PYRAMID VALLEY", distance: "Opposite property" },
      { label: "KANAKAPURA ROAD", distance: "10 mins away" },
    ],
  },
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=HkWkA_5op30",
    thumbnail: "/Villa_Retreats/Magnolia/Hero/hero.webp",
    duration: "1:41",
  },
  faq: [
    {
      question: "What is the maximum capacity for grand weddings?",
      answer:
        "The 25,000 sq. ft. lawn can comfortably host events for up to 500 guests with ample seating and catering space.",
    },
    {
      question: "Is the pool depth suitable for children?",
      answer:
        "The massive private pool has varying depth levels, but we recommend supervising children at all times in the pool and deck areas.",
    },
    {
      question: "Can we use the multipurpose hall for stay?",
      answer:
        "Yes, the hall is flexible and can be converted into a dorm-style room for larger groups or used for conference meetings.",
    },
  ],
};

export const magnolia = {
  ...magnoliaBase,
  amenityHighlights: amenityHighlightsFrom(magnoliaBase.amenities),
};
