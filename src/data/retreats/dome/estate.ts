import {
  BLUE_DOME_IMAGES,
  DOME_ESTATE_ACTIVITIES,
  DOME_ESTATE_SHARED,
  DOME_GROUP_AMENITIES,
  DOME_PERFECT_FOR_CARDS,
  RED_DOME_IMAGES,
  YELLOW_DOME_IMAGES,
} from "./shared";

export const domeVillas = {
  id: "dome-villas",
  hideFromVillasDirectory: true,
  name: "Dome Villas",
  description:
    "A private estate featuring three dome villas designed for group stays and shared experiences. The property is booked entirely by one group, offering uninterrupted access across all villas and outdoor spaces. With distributed living across three structures, landscaped pathways, and a private plunge pool, the space balances privacy and togetherness. Designed for gatherings, celebrations, and extended stays.",
  thumbnail: "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
  image: "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
  images: [
    "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
    "/Villa_Retreats/Dome/Hero Main/Hero 2.webp",
    ...BLUE_DOME_IMAGES,
    ...RED_DOME_IMAGES,
    ...YELLOW_DOME_IMAGES,
  ],
  ...DOME_ESTATE_SHARED,
  activities: DOME_ESTATE_ACTIVITIES,
  perfectForCards: DOME_PERFECT_FOR_CARDS,
  spaces: [
    { name: "Blue Dome", image: BLUE_DOME_IMAGES[0] },
    { name: "Red Dome", image: RED_DOME_IMAGES[0] },
    { name: "Yellow Dome", image: YELLOW_DOME_IMAGES[0] },
  ],
  categorizedSpaces: [
    {
      id: "blue-dome",
      title: "Blue Dome",
      category: "Blue Dome",
      amenities: DOME_GROUP_AMENITIES,
      images: BLUE_DOME_IMAGES,
    },
    {
      id: "red-dome",
      title: "Red Dome",
      category: "Red Dome",
      amenities: DOME_GROUP_AMENITIES,
      images: RED_DOME_IMAGES,
    },
    {
      id: "yellow-dome",
      title: "Yellow Dome",
      category: "Yellow Dome",
      amenities: DOME_GROUP_AMENITIES,
      images: YELLOW_DOME_IMAGES,
    },
  ],
  propertyDetails: [
    {
      label: "Three Dome Villas (Private Estate)",
      description:
        "Entire property includes three independent Villas booked together.",
      icon: "Building",
    },
    {
      label: "Distributed Living Layout",
      description:
        "Bedrooms and living spaces spread across multiple structures.",
      icon: "Layout",
    },
    {
      label: "Private Plunge Pool",
      description: "Outdoor pool accessible to all guests within the estate.",
      icon: "Waves",
    },
    {
      label: "Landscaped Garden Property",
      description: "Connected pathways and outdoor zones across the property.",
      icon: "Trees",
    },
    {
      label: "Multiple Sit-out Areas",
      description: "Dedicated outdoor seating, swings, and relaxation zones.",
      icon: "Sofa",
    },
    {
      label: "Exclusive Use Property",
      description: "Not shared with other guests during the stay.",
      icon: "Lock",
    },
  ],
  video: {
    youtubeUrl: "https://www.youtube.com/watch?v=k0-1rTGdowk",
    thumbnail: "/Villa_Retreats/Dome/Hero Main/Hero 1.webp",
    duration: "1:21",
  },
  faq: [
    {
      question: "Is the property shared with other guests?",
      answer:
        "The full Dome Villas estate is booked exclusively for one group, including all three domes.",
    },
    {
      question: "How many Villas are included?",
      answer:
        "The property includes three Dome Villas within one private estate.",
    },
    {
      question: "How many guests can stay overnight?",
      answer: "Up to 18 guests can be accommodated.",
    },
    {
      question: "Is the pool private?",
      answer: "Yes, the plunge pool is exclusively accessible to guests.",
    },
    {
      question: "Are meals included?",
      answer: "Meals can be arranged on request.",
    },
  ],
};
