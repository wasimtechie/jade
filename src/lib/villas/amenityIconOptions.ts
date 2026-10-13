/**
 * Categorized Lucide icon registry for villa amenities, services, and property details.
 */

export type IconCategory =
  | "Wellness"
  | "Outdoor"
  | "Indoor"
  | "Food & drink"
  | "Events"
  | "Transport"
  | "Tech"
  | "Services"
  | "Nature"
  | "General";

export type VillaIconOption = {
  name: string;
  category: IconCategory;
  keywords: string[];
};

export const VILLA_ICON_REGISTRY: VillaIconOption[] = [
  { name: "Waves", category: "Outdoor", keywords: ["pool", "water", "swim"] },
  { name: "Wind", category: "Outdoor", keywords: ["breeze", "ac", "air"] },
  { name: "Sun", category: "Outdoor", keywords: ["sunny", "terrace", "deck"] },
  { name: "Trees", category: "Nature", keywords: ["garden", "forest", "green"] },
  { name: "Mountain", category: "Nature", keywords: ["view", "hills"] },
  { name: "Leaf", category: "Nature", keywords: ["eco", "organic"] },
  { name: "Flower2", category: "Nature", keywords: ["floral", "garden"] },
  { name: "Palmtree", category: "Nature", keywords: ["tropical", "beach"] },
  { name: "Home", category: "Indoor", keywords: ["villa", "house"] },
  { name: "BedDouble", category: "Indoor", keywords: ["bedroom", "sleep"] },
  { name: "Bath", category: "Indoor", keywords: ["bathroom", "shower"] },
  { name: "Sofa", category: "Indoor", keywords: ["lounge", "living"] },
  { name: "Lamp", category: "Indoor", keywords: ["lighting", "ambience"] },
  { name: "Armchair", category: "Indoor", keywords: ["seating", "comfort"] },
  { name: "DoorOpen", category: "Indoor", keywords: ["entrance", "access"] },
  { name: "ChefHat", category: "Food & drink", keywords: ["chef", "cooking", "kitchen"] },
  { name: "Coffee", category: "Food & drink", keywords: ["breakfast", "cafe"] },
  { name: "Wine", category: "Food & drink", keywords: ["bar", "drinks"] },
  { name: "UtensilsCrossed", category: "Food & drink", keywords: ["dining", "meals"] },
  { name: "HandPlatter", category: "Services", keywords: ["butler", "service"] },
  { name: "Bell", category: "Services", keywords: ["concierge", "call"] },
  { name: "Sparkles", category: "Services", keywords: ["luxury", "premium"] },
  { name: "SprayCan", category: "Services", keywords: ["housekeeping", "clean"] },
  { name: "ShieldCheck", category: "Services", keywords: ["security", "safe"] },
  { name: "Heart", category: "Wellness", keywords: ["spa", "romance"] },
  { name: "Dumbbell", category: "Wellness", keywords: ["gym", "fitness"] },
  { name: "Flame", category: "Wellness", keywords: ["sauna", "fire", "bbq"] },
  { name: "Droplets", category: "Wellness", keywords: ["spa", "steam"] },
  { name: "Car", category: "Transport", keywords: ["parking", "drive"] },
  { name: "Plane", category: "Transport", keywords: ["airport", "transfer"] },
  { name: "Bike", category: "Transport", keywords: ["cycling"] },
  { name: "Ship", category: "Transport", keywords: ["boat", "cruise"] },
  { name: "Wifi", category: "Tech", keywords: ["internet", "wireless"] },
  { name: "Tv", category: "Tech", keywords: ["entertainment", "screen"] },
  { name: "Music", category: "Tech", keywords: ["audio", "sound"] },
  { name: "Mic", category: "Tech", keywords: ["karaoke", "events"] },
  { name: "Camera", category: "Tech", keywords: ["photo", "video"] },
  { name: "Zap", category: "Tech", keywords: ["power", "generator"] },
  { name: "PartyPopper", category: "Events", keywords: ["celebration", "party"] },
  { name: "Presentation", category: "Events", keywords: ["corporate", "meeting"] },
  { name: "Dribbble", category: "Events", keywords: ["sports", "games"] },
  { name: "Users", category: "Events", keywords: ["group", "guests"] },
  { name: "Cake", category: "Events", keywords: ["birthday", "wedding"] },
  { name: "Church", category: "Events", keywords: ["wedding", "ceremony"] },
  { name: "LayoutGrid", category: "General", keywords: ["layout", "grid"] },
  { name: "MapPin", category: "General", keywords: ["location", "address"] },
  { name: "Phone", category: "General", keywords: ["contact", "call"] },
  { name: "Mail", category: "General", keywords: ["email", "contact"] },
  { name: "Clock", category: "General", keywords: ["time", "hours"] },
  { name: "Key", category: "General", keywords: ["access", "checkin"] },
  { name: "Lock", category: "General", keywords: ["privacy", "secure"] },
  { name: "Star", category: "General", keywords: ["featured", "rating"] },
  { name: "Award", category: "General", keywords: ["premium", "badge"] },
  { name: "Gem", category: "General", keywords: ["luxury", "exclusive"] },
  { name: "Globe", category: "General", keywords: ["world", "travel"] },
  { name: "Building2", category: "General", keywords: ["estate", "property"] },
  { name: "Warehouse", category: "General", keywords: ["hall", "space"] },
  { name: "Fence", category: "Outdoor", keywords: ["boundary", "private"] },
  { name: "Tent", category: "Outdoor", keywords: ["glamping", "camp"] },
  { name: "Umbrella", category: "Outdoor", keywords: ["shade", "poolside"] },
  { name: "Footprints", category: "Outdoor", keywords: ["walk", "trail"] },
  { name: "ScanSearch", category: "Outdoor", keywords: ["view", "wildlife", "binoculars"] },
  { name: "Fish", category: "Outdoor", keywords: ["pond", "angling"] },
  { name: "Gamepad2", category: "Indoor", keywords: ["games", "play"] },
  { name: "BookOpen", category: "Indoor", keywords: ["library", "read"] },
  { name: "Paintbrush", category: "Indoor", keywords: ["art", "decor"] },
  { name: "Heater", category: "Indoor", keywords: ["warm", "winter"] },
  { name: "Snowflake", category: "Indoor", keywords: ["ac", "cool"] },
  { name: "Refrigerator", category: "Food & drink", keywords: ["fridge", "minibar"] },
  { name: "Sandwich", category: "Food & drink", keywords: ["snacks", "food"] },
  { name: "Martini", category: "Food & drink", keywords: ["cocktail", "bar"] },
  { name: "ConciergeBell", category: "Services", keywords: ["staff", "help"] },
  { name: "Stethoscope", category: "Services", keywords: ["medical", "first aid"] },
  { name: "Baby", category: "Services", keywords: ["family", "kids"] },
  { name: "Dog", category: "Services", keywords: ["pet", "friendly"] },
  { name: "Accessibility", category: "Services", keywords: ["wheelchair", "accessible"] },
  { name: "Recycle", category: "Nature", keywords: ["sustainable", "eco"] },
  { name: "CloudSun", category: "Nature", keywords: ["weather", "climate"] },
  { name: "Compass", category: "General", keywords: ["direction", "explore"] },
  { name: "Search", category: "General", keywords: ["find", "lookup"] },
  { name: "Check", category: "General", keywords: ["included", "yes"] },
  { name: "User", category: "General", keywords: ["guest", "person"] },
  { name: "UserCheck", category: "Services", keywords: ["host", "greeter"] },
  { name: "Volume2", category: "Tech", keywords: ["speaker", "music"] },
  { name: "Projector", category: "Events", keywords: ["cinema", "screening"] },
  { name: "Ruler", category: "General", keywords: ["size", "area"] },
  { name: "Maximize", category: "General", keywords: ["space", "expansive"] },
];

/** @deprecated Use VILLA_ICON_REGISTRY — flat list for backward compatibility */
export const VILLA_AMENITY_ICON_OPTIONS = VILLA_ICON_REGISTRY.map(
  (i) => i.name,
) as readonly string[];

export type VillaAmenityIconName = string;

export const ICON_CATEGORIES: IconCategory[] = [
  "General",
  "Wellness",
  "Outdoor",
  "Indoor",
  "Food & drink",
  "Events",
  "Transport",
  "Tech",
  "Services",
  "Nature",
];

export function searchIcons(query: string, category?: IconCategory): VillaIconOption[] {
  const q = query.trim().toLowerCase();
  return VILLA_ICON_REGISTRY.filter((icon) => {
    if (category && icon.category !== category) return false;
    if (!q) return true;
    return (
      icon.name.toLowerCase().includes(q) ||
      icon.keywords.some((k) => k.includes(q)) ||
      icon.category.toLowerCase().includes(q)
    );
  });
}

export function iconsByCategory(): Record<IconCategory, VillaIconOption[]> {
  const out = {} as Record<IconCategory, VillaIconOption[]>;
  for (const cat of ICON_CATEGORIES) out[cat] = [];
  for (const icon of VILLA_ICON_REGISTRY) {
    out[icon.category].push(icon);
  }
  return out;
}
