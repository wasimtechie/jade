import { connectDB } from "@/lib/db";
import type { BookingRecord } from "@/lib/bookings/store";
import { BookingModel } from "@/models/Booking";
import type { Types } from "mongoose";
import { getBookingHistory, type BookingHistoryEntry } from "./bookingHistory";

function toFolioRecord(
  doc: {
    _id: Types.ObjectId;
    bookingToken: string;
    villaId: { _id?: Types.ObjectId; slug?: string; name?: string } | Types.ObjectId;
    bookingType: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestDetails?: { name?: string; email?: string; phone?: string };
    pricing?: BookingRecord["pricing"];
    payment?: BookingRecord["payment"];
    status: string;
    source?: string;
    notes?: string;
    stayStatus?: string;
    axisRoomsSynced?: boolean;
    axisRoomsCancelSynced?: boolean;
    axisRoomsLastError?: string;
    axisRoomsReservationId?: string;
    addOns?: BookingRecord["addOns"];
    expiresAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  },
): BookingRecord & {
  villaSlug?: string;
  villaName?: string;
  axisRoomsReservationId?: string;
} {
  const villa =
    doc.villaId &&
    typeof doc.villaId === "object" &&
    "slug" in doc.villaId
      ? doc.villaId
      : null;
  const villaId = villa?._id
    ? String(villa._id)
    : String(doc.villaId);

  return {
    id: String(doc._id),
    bookingToken: doc.bookingToken,
    villaId,
    villaSlug: villa?.slug,
    villaName: villa?.name,
    bookingType: doc.bookingType as BookingRecord["bookingType"],
    checkIn: doc.checkIn,
    checkOut: doc.checkOut,
    guests: doc.guests,
    guestDetails: {
      name: doc.guestDetails?.name ?? "",
      email: doc.guestDetails?.email ?? "",
      phone: doc.guestDetails?.phone ?? "",
    },
    pricing: doc.pricing as BookingRecord["pricing"],
    payment: doc.payment as BookingRecord["payment"],
    status: doc.status as BookingRecord["status"],
    source: doc.source,
    notes: doc.notes,
    stayStatus: doc.stayStatus as BookingRecord["stayStatus"],
    axisRoomsSynced: doc.axisRoomsSynced,
    axisRoomsCancelSynced: doc.axisRoomsCancelSynced,
    axisRoomsLastError: doc.axisRoomsLastError,
    axisRoomsReservationId: doc.axisRoomsReservationId,
    addOns: doc.addOns,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt ?? new Date(),
    updatedAt: doc.updatedAt ?? new Date(),
  };
}

export type BookingFolioDetail = {
  booking: BookingRecord & {
    villaSlug?: string;
    villaName?: string;
    axisRoomsReservationId?: string;
  };
  history: BookingHistoryEntry[];
};

export async function getBookingFolioDetail(
  bookingId: string,
): Promise<BookingFolioDetail | null> {
  await connectDB();
  const doc = await BookingModel.findOne({ _id: bookingId, isDeleted: false })
    .populate("villaId", "slug name")
    .lean();
  if (!doc) return null;

  const booking = toFolioRecord(doc as never);
  const history = await getBookingHistory(bookingId);
  return { booking, history };
}
