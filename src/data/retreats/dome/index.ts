export {
  BLUE_DOME_IMAGES,
  DOME_ESTATE_ACTIVITIES,
  DOME_GROUP_AMENITIES,
  RED_DOME_IMAGES,
  YELLOW_DOME_IMAGES,
  buildSingleDomeVilla,
} from "./shared";
export { domeVillas } from "./estate";

import { buildSingleDomeVilla } from "./shared";

export const blueDomeVilla = buildSingleDomeVilla("blue");
export const redDomeVilla = buildSingleDomeVilla("red");
export const yellowDomeVilla = buildSingleDomeVilla("yellow");

export const DOME_VILLA_VARIANTS = [
  blueDomeVilla,
  redDomeVilla,
  yellowDomeVilla,
] as const;
