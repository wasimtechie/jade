import type { AddOnLine, BookingPayment, BookingPricing, BookingStatus, BookingType, PaymentPlan, StayStatus } from "./types";

export interface CreateBookingParams {
  villaId: string;
  villaSlug: string;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  guests: number;
  adults: number;
  children: number;
  pets: number;
  guestDetails: { name: string; email: string; phone: string };
  notes?: string;
  addOns?: AddOnLine[];
  eventTierId?: string;
  eventGuests?: number;
  eventStartDate?: string;
  eventEndDate?: string;
  paymentPlan: PaymentPlan;
  pricing: BookingPricing;
  payment: BookingPayment;
  bookingToken: string;
  expiresAt: Date;
  ip?: string;
}

export interface BookingRecord {
  id: string;
  bookingToken: string;
  villaId: string;
  villaSlug?: string;
  bookingType: BookingType;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestDetails: { name: string; email: string; phone: string };
  pricing: BookingPricing;
  payment: BookingPayment;
  status: BookingStatus;
  stayStatus?: StayStatus;
  source?: string;
  notes?: string;
  axisRoomsSynced?: boolean;
  axisRoomsCancelSynced?: boolean;
  axisRoomsLastError?: string;
  axisRoomsReservationId?: string;
  addOns?: AddOnLine[];
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModifyBookingPreview {
  current: { checkIn: string; checkOut: string; pricing: BookingPricing };
  proposed: { checkIn: string; checkOut: string; pricing: BookingPricing };
  deltaPaise: number;
  paymentPreview: BookingPayment;
  paymentWarning?: string;
  available: boolean;
  conflictingDate?: string;
  axisWillSync: boolean;
  unchanged: boolean;
}

export interface ModifyBookingDatesResult {
  booking: BookingRecord;
  oldCheckIn: string;
  oldCheckOut: string;
  paymentWarning?: string;
}

export interface BookingStore {
  createPending(params: CreateBookingParams): Promise<BookingRecord>;
  findById(id: string): Promise<BookingRecord | null>;
  findByToken(token: string): Promise<BookingRecord | null>;
  findByOrderId(orderId: string): Promise<BookingRecord | null>;
  listActive(filters?: { villaId?: string }): Promise<BookingRecord[]>;
  confirmPayment(params: {
    bookingId: string;
    orderId: string;
    paymentId: string;
    eventId: string;
  }): Promise<{ ok: boolean; alreadyConfirmed?: boolean }>;
  expirePending(now: Date): Promise<number>;
  updateStayStatus(id: string, stayStatus: StayStatus): Promise<BookingRecord | null>;
  cancelBooking(
    id: string,
    userId?: string,
    options?: { reason?: string },
  ): Promise<BookingRecord | null>;
  confirmHold(id: string, userId?: string, waivePayment?: boolean): Promise<BookingRecord | null>;
  confirmExternalPayment(
    id: string,
    userId?: string,
    options?: {
      externalPaymentRef?: string;
      paymentChannel?: import("./confirmExternalPayment").ExternalPaymentChannel;
      fullAmountReceived?: boolean;
      receivedPaise?: number;
    },
  ): Promise<BookingRecord | null>;
  updateNotes(id: string, notes: string): Promise<BookingRecord | null>;
  createManual(params: CreateBookingParams & { source?: string; status?: BookingStatus }): Promise<BookingRecord>;
  softDelete(id: string, userId?: string): Promise<boolean>;
  getAvailability(
    villaId: string,
    from: string,
    to: string,
    excludeBookingId?: string,
  ): Promise<{
    bookedDates: string[];
    blockedDates: string[];
  }>;
  previewModifyBookingDates(
    id: string,
    params: { checkIn: string; checkOut: string },
  ): Promise<ModifyBookingPreview | null>;
  modifyBookingDates(
    id: string,
    params: { checkIn: string; checkOut: string; userId?: string },
  ): Promise<ModifyBookingDatesResult | null>;
}
