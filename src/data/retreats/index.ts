import { magnolia } from "./magnolia";
import { tranquil } from "./tranquil";
import { royalty } from "./royalty";
import {
  domeVillas,
  blueDomeVilla,
  redDomeVilla,
  yellowDomeVilla,
} from "./dome";
import { diamond } from "./diamond";
import { vannani } from "./vannani";
import { haven } from "./haven";
import { retreatOnTheRidge } from "./retreat-on-the-ridge";
import { emerald } from "./emerald";
import { wonderland } from "./wonderland";
import { jade735 } from "./jade-735";
import { lemonTree } from "./lemon-tree";
import { loungeFly } from "./lounge-fly";
import { palatio } from "./palatio";

import { enrichAllVillas } from "@/lib/villas/applyCanonicalOperational";
import type { Villa } from "@/lib/types";

export {
  magnolia,
  tranquil,
  royalty,
  domeVillas,
  blueDomeVilla,
  redDomeVilla,
  yellowDomeVilla,
  diamond,
  vannani,
  haven,
  retreatOnTheRidge,
  emerald,
  wonderland,
  jade735,
  lemonTree,
  loungeFly,
  palatio,
};

/** Estate dome + hidden VILLAS stay in VILLAS for detail/booking; directory filters `hideFromVillasDirectory`. */
const VILLAS_RAW = [
  magnolia,
  tranquil,
  royalty,
  blueDomeVilla,
  redDomeVilla,
  yellowDomeVilla,
  diamond,
  haven,
  retreatOnTheRidge,
  emerald,
  wonderland,
  jade735,
  lemonTree,
  loungeFly,
  palatio,
  domeVillas,
  vannani,
];

/** Public + booking villa records with canonical pricing/stats from Jade_Property_Data.md */
export const VILLAS = enrichAllVillas(VILLAS_RAW) as Villa[];

export const CATEGORIES = [
  "All",
  "Pet Friendly",
  "Weddings",
  "Party Venues",
  "Corporate Retreats",
  "Weekend Getaways",
  "Luxury Stays",
  "Nature Retreats",
];
