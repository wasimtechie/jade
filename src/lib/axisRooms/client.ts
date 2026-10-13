/** Axis Rooms channel manager — inventory push via API 1 (not reservation REST). */

import type { AxisRoomsPushResult } from "./types";
import {
  syncBookingInventoryClose,
  syncBookingInventoryOpen,
} from "./sync";

type AxisRoomsBooking = {
  _id: unknown;
  villaId: unknown;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  axisRoomsSynced?: boolean;
  source?: string;
};

/** Close OTA inventory for booked nights (free: 0). */
export async function pushAxisRoomsReservation(
  booking: AxisRoomsBooking,
): Promise<AxisRoomsPushResult> {
  return syncBookingInventoryClose(booking);
}

/** Release OTA inventory on cancel (free: 1). */
export async function pushAxisRoomsCancellation(
  booking: AxisRoomsBooking,
): Promise<AxisRoomsPushResult> {
  return syncBookingInventoryOpen(booking);
}
