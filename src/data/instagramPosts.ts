export type InstagramPost = {
  id: string;
  type: "p" | "reel";
  fallbackImage: string;
  handle: string;
  caption: string;
  likes: string;
  comments: string;
  commentPreview: { user: string; text: string }[];
};

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "DCRJKQozm9F",
    type: "p",
    fallbackImage: "/Experiences/Party Villas/2-Party Type/Pool Parties.webp",
    handle: "@jadehospitainment",
    caption: "Paradise found @jade 💗🌸",
    likes: "2.4k",
    comments: "89",
    commentPreview: [
      { user: "luxurytravel", text: "This pool view is unreal." },
      { user: "weekendvibes", text: "Adding this to my wishlist." },
    ],
  },
  {
    id: "DBrM8YMy1UC",
    type: "p",
    fallbackImage: "/Home Page/4-Venue Images/1.webp",
    handle: "@jadehospitainment",
    caption: "Amazing found @jade 💗🌸",
    likes: "2.4k",
    comments: "89",
    commentPreview: [
      { user: "staycation", text: "That courtyard swing is everything." },
      { user: "foodie", text: "Need a bonfire night here." },
    ],
  },
  {
    id: "DOJYFnEAWz4",
    type: "p",
    fallbackImage:
      "/Experiences/Party Villas/2-Party Type/Birthdays & Anniversaries.webp",
    handle: "@jadehospitainment",
    caption: "Celebrations, but make it Jade.",
    likes: "1.9k",
    comments: "64",
    commentPreview: [
      { user: "partyplanner", text: "Perfect setup for birthdays." },
      { user: "friends", text: "Book it. We’re coming." },
    ],
  },
  {
    id: "DPNzH4ACZnp",
    type: "p",
    fallbackImage:
      "/Experiences/Party Villas/2-Party Type/Bachelor_Bachelorette Parties.webp",
    handle: "@jadehospitainment",
    caption: "Party Villas. Big energy.",
    likes: "2.1k",
    comments: "71",
    commentPreview: [
      { user: "nightowl", text: "This looks like a movie scene." },
      { user: "musiclover", text: "DJ + pool = sold." },
    ],
  },
  {
    id: "C_aq1_qya_e",
    type: "reel",
    fallbackImage:
      "/Experiences/Party Villas/2-Party Type/Reunions & Graduation Parties.webp",
    handle: "@jadehospitainment",
    caption: "Poolside scenes, unforgettable nights.",
    likes: "3.2k",
    comments: "112",
    commentPreview: [
      { user: "reels", text: "The vibe is immaculate." },
      { user: "sunsetclub", text: "Weekend goals." },
    ],
  },
  {
    id: "C_N0gQJhTp4",
    type: "reel",
    fallbackImage: "/Home Page/4-Venue Images/DJI_0277.webp",
    handle: "@jadehospitainment",
    caption: "Where hospitality meets entertainment.",
    likes: "2.7k",
    comments: "93",
    commentPreview: [
      { user: "corporateretreat", text: "This would be a great team offsite." },
      { user: "travelmore", text: "Saving this!" },
    ],
  },
  {
    id: "C681aInK5jn",
    type: "reel",
    fallbackImage: "/Home Page/2-Experiences/Weddings.webp",
    handle: "@jadehospitainment",
    caption: "Moments that feel cinematic.",
    likes: "2.5k",
    comments: "84",
    commentPreview: [
      { user: "weddings", text: "Venue + lighting is stunning." },
      { user: "bride", text: "Dreamy." },
    ],
  },
  {
    id: "C5KsbqBvNLf",
    type: "reel",
    fallbackImage: "/Home Page/2-Experiences/Wellness.webp",
    handle: "@jadehospitainment",
    caption: "Recharge. Reconnect. Repeat.",
    likes: "1.6k",
    comments: "42",
    commentPreview: [
      { user: "wellness", text: "So calming." },
      { user: "reset", text: "Need this break." },
    ],
  },
  {
    id: "CzIjR_3Lj_H",
    type: "reel",
    fallbackImage: "/Home Page/2-Experiences/casual stays.webp",
    handle: "@jadehospitainment",
    caption: "Easy getaways, elevated.",
    likes: "1.8k",
    comments: "55",
    commentPreview: [
      { user: "staycation", text: "This is exactly what I needed." },
      { user: "wander", text: "Looks peaceful." },
    ],
  },
  {
    id: "Cxp7fnkvZm9",
    type: "reel",
    fallbackImage:
      "/Home Page/The Value Jade Provides/Private Villa Retreats around Bangalore 2.webp",
    handle: "@jadehospitainment",
    caption: "Private Villas around Bangalore.",
    likes: "2.0k",
    comments: "68",
    commentPreview: [
      { user: "bangalore", text: "Didn’t know this existed so close!" },
      { user: "getaway", text: "Booked for next weekend." },
    ],
  },
];
