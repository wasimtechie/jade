/**
 * Client portfolio-aligned copy & specs (from Jade_Property_Data.md).
 * Merged in enrichVilla — does not replace spaces/images from retreat files.
 */

type MdPatch = {
  description?: string;
  propertyDetails?: Array<{
    label?: string;
    title?: string;
    description: string;
    icon?: string;
  }>;
  locationDetails?: {
    address?: string;
    distance?: string;
    nearby?: Array<{ label: string; distance: string }>;
  };
};

export const RETREAT_MD_CONTENT: Record<string, MdPatch> = {
  magnolia: {
    description:
      "Magnolia is a contemporary glass house villa on Kanakapura Road — ~20 minutes from the Art of Living Centre, opposite Pyramid Valley. A private pool with poolside bar and lounge, 8-seater home theatre, multipurpose hall, 21,000 sq.ft event lawn, and basketball court support stays, celebrations, and weddings for up to 500–1,000 guests (floating).",
    propertyDetails: [
      {
        label: "3 BR + family room",
        description: "3 bedrooms plus family room (5 beds total) across 4,800 sq.ft built-up on 1 acre.",
        icon: "Bed",
      },
      {
        label: "21,000 sq.ft lawn",
        description: "Event lawn seating 100–150 (round) up to 300 (theatre); floating events up to 500–1,000.",
        icon: "Sun",
      },
      {
        label: "Pool 21×40 ft",
        description: "Private pool (3.5–5.5 ft) with poolside bar, lounge, and patio.",
        icon: "Waves",
      },
      {
        label: "Kanakapura Road",
        description: "~20 min Art of Living · opposite Pyramid Valley.",
        icon: "MapPin",
      },
    ],
    locationDetails: {
      address: "Magnolia by Jade, Kanakapura Road (opposite Pyramid Valley), Bangalore",
      distance: "~45 min from Bangalore city centre",
      nearby: [
        { label: "Art of Living", distance: "~20 min" },
        { label: "Kanakapura / NICE", distance: "6–10 km" },
        { label: "Airport", distance: "77 km" },
        { label: "Electronic City", distance: "38 km" },
        { label: "Forum Koramangala", distance: "47 km" },
        { label: "Whitefield", distance: "60 km" },
      ],
    },
  },
  tranquil: {
    description:
      "Tranquil Woods is a 6-bedroom estate — a 2-BR glasshouse plus four garden-view suites on 2 acres. Adult and kids' pools, outdoor amphitheatre, 50,000+ sq.ft multi-level gardens, and open-air dining hall suit weddings (300 seated, 500–1,000 floating) and large retreats. Five minutes from Art of Living, 20 minutes from Forum Mall.",
    propertyDetails: [
      {
        label: "6-bedroom estate",
        description: "2-BR glasshouse + 4 garden-view suites · 6,000 sq.ft built-up · 2 acres.",
        icon: "Bed",
      },
      {
        label: "50,000+ sq.ft gardens",
        description: "Lawn seated 300; floating 500–1,000; open-air hall 100–120 seated.",
        icon: "Trees",
      },
      {
        label: "Adult + kids pools",
        description: "Adult pool 16×30 ft (3.5–5 ft); kids' pool on estate.",
        icon: "Waves",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Art of Living", distance: "5 min" },
        { label: "Forum Mall", distance: "20 min" },
        { label: "Airport", distance: "62 km" },
        { label: "Electronic City", distance: "23 km" },
        { label: "Majestic", distance: "27 km" },
        { label: "Whitefield", distance: "46 km" },
      ],
    },
  },
  emerald: {
    description:
      "Emerald is a 2-bedroom heritage glasshouse villa with sky-lit central courtyard, aqua-blue pool with 8-ft waterfall, and private garden exits. Farm-to-table butler dining and semi-open gazebo on 1 acre — 5 min Embassy Riding School, 35 min Hebbal. Stay base 8 guests (10 max); events up to 25–30.",
    propertyDetails: [
      {
        label: "2 BHK heritage villa",
        description: "2,016 sq.ft built-up · 1 acre · 2 bathrooms.",
        icon: "Bed",
      },
      {
        label: "Pool + waterfall",
        description: "16×30 ft pool (3.5–5 ft) with 8-ft waterfall.",
        icon: "Waves",
      },
      {
        label: "2,800 sq.ft garden",
        description: "Courtyard living with private garden sit-outs.",
        icon: "Sun",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Embassy Riding School", distance: "5 min" },
        { label: "Airport", distance: "23 km · ~30 min" },
        { label: "Manyata", distance: "33 km" },
        { label: "Forum", distance: "43 km" },
        { label: "Hebbal", distance: "35 min" },
      ],
    },
  },
  "dome-villas-blue": {
    description:
      "Blue Dome is a duplex dome villa with 3 BR / 3 bath, patio sit-out with hill and paddy views, private plunge pool (13×10 ft), outdoor dining, hobbit-hole windows, and access to the shared cluster stage. Doddaballapur — ~30 min from airport toll gate.",
    propertyDetails: [
      {
        label: "Duplex dome · 3 BR",
        description: "1,062 sq.ft built-up · plunge pool 13×10 ft · lawn 1,160 sq.ft.",
        icon: "Home",
      },
    ],
  },
  "dome-villas-red": {
    description:
      "Red Dome is a single-level, family-friendly dome (no stairs) with 3 BR / 3 bath, plunge pool 15×15 ft plus kids' pool, outdoor dining, landscaped lawn, and shared cluster stage.",
    propertyDetails: [
      {
        label: "Single-level dome · 3 BR",
        description: "1,872 sq.ft built-up · lawn 1,650 sq.ft.",
        icon: "Home",
      },
    ],
  },
  "dome-villas-yellow": {
    description:
      "Yellow Dome sits closest to the hills with Greek-style terrace bath (9×10 ft), open-to-sky courtyard, outdoor dining with dry kitchen, and the best hill views in the cluster. 3 BR / 2 bath.",
    propertyDetails: [
      {
        label: "Hillside dome · 3 BR",
        description: "3,016 sq.ft built-up · lawn 1,040 sq.ft.",
        icon: "Home",
      },
    ],
  },
  "dome-villas": {
    description:
      "Dome Villas is a private cluster of three architecturally distinct dome villas at Doddaballapur — Blue, Red, and Yellow — booked together for group stays. Combined cluster capacity ~30–35 guests with shared stage and landscaped gardens.",
    propertyDetails: [
      {
        label: "Three-dome private estate",
        description: "Blue (duplex), Red (single-level + kids pool), Yellow (Greek terrace bath).",
        icon: "Building",
      },
      {
        label: "Cluster capacity",
        description: "~24 stay guests across villas · ~35 guests for cluster events.",
        icon: "Users",
      },
    ],
  },
  "retreat-on-the-ridge": {
    description:
      "Retreat on the Ridge is a 4-bedroom hillside villa near Varalakonda Hill — 30 min Nandi Hills, 50 min airport toll. Pool 29×17 ft with waterfall and Buddha, hill-view gazebo, fire pit, poolside bar, and sunset terrace. Events up to 40 guests on 2,990 sq.ft lawn.",
    propertyDetails: [
      {
        label: "4 BHK hillside villa",
        description: "Hilltop setting · pool with waterfall · 2,990 sq.ft lawn.",
        icon: "Bed",
      },
      {
        label: "Near Nandi Hills",
        description: "30 min Nandi Hills · Gudibanda Fort ~9 km.",
        icon: "MapPin",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Nandi Hills", distance: "30 min" },
        { label: "Airport toll", distance: "50 min" },
        { label: "Gudibanda Fort", distance: "9 km · 20 min" },
        { label: "Hebbal", distance: "77 km" },
        { label: "Forum", distance: "89 km" },
      ],
    },
  },
  "lemon-tree": {
    description:
      "Lemon Tree is a 3-bedroom farmstay inside a lemon and areca-nut plantation — 25 min from IKEA. Three-storey 5,000 sq.ft home with rooftop pool 30×22 ft, multipurpose hall, badminton/archery/darts, plantation walks, and bonfire/BBQ. Events up to 50–60 guests.",
    propertyDetails: [
      {
        label: "3 BHK farmstay",
        description: "5,000 sq.ft three-storey · rooftop pool · plantation setting.",
        icon: "Bed",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "IKEA", distance: "25 min" },
        { label: "Airport", distance: "59 km" },
        { label: "Hebbal", distance: "37 km" },
        { label: "Nandi Hills", distance: "65 km" },
        { label: "Forum", distance: "44 km" },
      ],
    },
  },
  haven: {
    description:
      "Haven is a 5-bedroom pool villa beside Meco Kartopia with race-track views — 10 min from Byg Brewski, Hennur. Jacuzzi suite, 75\" TV, pool table, massage chair, and 17,600 sq.ft lawn with event stage. Weddings 100–150 seated, up to 800 floating.",
    propertyDetails: [
      {
        label: "5 BHK pool villa",
        description: "3,500 sq.ft · pool 14×22 ft · lawn 17,600 sq.ft + stage.",
        icon: "Bed",
      },
      {
        label: "Event lawn",
        description: "100–150 seated · up to 800 floating guests.",
        icon: "Sun",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Byg Brewski", distance: "10 min" },
        { label: "Meco Kartopia", distance: "Adjacent" },
      ],
    },
  },
  diamond: {
    description:
      "Diamond Pavilion is a 9-bedroom event estate on Kanakapura Road — 10 min Art of Living, 20 min Forum. Infinity pool 45×30 ft, 1-acre lawn, dormitory hall; stay up to 70 with dorm. Weddings 200–400 seated, up to 2,000 floating.",
    propertyDetails: [
      {
        label: "9 BR + dormitory",
        description: "10,000 sq.ft built-up · infinity pool · 1-acre event lawn.",
        icon: "Bed",
      },
      {
        label: "Large-scale events",
        description: "200–400 seated (theatre) · up to 2,000 floating.",
        icon: "Users",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Art of Living", distance: "10 min" },
        { label: "Forum", distance: "20 min" },
        { label: "Airport", distance: "62 km" },
        { label: "Electronic City", distance: "23 km" },
      ],
    },
  },
  "jade-735": {
    description:
      "Jade 735 is a 4-bedroom Balinese villa in Sadahalli gated community — 5 min airport toll. Waterfall pool, poolside lounge and bar, 6-seater rooftop jacuzzi (paid add-on ₹4,000), swinging bed, and semi-open living. Family groups only · max 10 guests · no loud parties.",
    propertyDetails: [
      {
        label: "4 BHK Balinese villa",
        description: "5,000 sq.ft built-up · pool ~20×30 ft · small lawn.",
        icon: "Bed",
      },
      {
        label: "House rules",
        description: "Family only · max 10 guests · advance ID · 2 cars at villa.",
        icon: "Shield",
      },
    ],
    locationDetails: {
      nearby: [
        { label: "Airport toll", distance: "5 min" },
        { label: "Airport", distance: "15 min · 12 km" },
        { label: "Club Cabana", distance: "2 min" },
        { label: "Hebbal", distance: "25 min" },
        { label: "Manyata", distance: "30 min" },
      ],
    },
  },
};

export function applyMdContentPatch<T extends { id: string }>(villa: T): T {
  const patch = RETREAT_MD_CONTENT[villa.id];
  if (!patch) return villa;

  const v = villa as T & {
    description?: string;
    propertyDetails?: MdPatch["propertyDetails"];
    locationDetails?: MdPatch["locationDetails"] & Record<string, unknown>;
  };

  return {
    ...villa,
    ...(patch.description ? { description: patch.description } : {}),
    ...(patch.propertyDetails ? { propertyDetails: patch.propertyDetails } : {}),
    ...(patch.locationDetails
      ? {
          locationDetails: {
            ...(v.locationDetails ?? {}),
            ...patch.locationDetails,
            nearby:
              patch.locationDetails.nearby ??
              (v.locationDetails as { nearby?: unknown })?.nearby,
          },
        }
      : {}),
  } as T;
}
