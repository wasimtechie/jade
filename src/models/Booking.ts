import { Schema, model, models, type InferSchemaType } from "mongoose";

const AddOnLineSchema = new Schema(
  { id: String, quantity: { type: Number, default: 1 } },
  { _id: false },
);

const PricingSnapshotSchema = new Schema(
  {
    basePricePaise: Number,
    dayOutBasePricePaise: Number,
    stayBasePax: Number,
    dayOutBasePax: Number,
    extraPaxStayPaise: Number,
    extraPaxDayOutPaise: Number,
    chargeableHeadsRule: {
      childFreeAgeLimit: Number,
      countInfants: Boolean,
    },
    eventTier: {
      id: String,
      label: String,
      mode: String,
      pricePaise: Number,
      stayIncludedPax: Number,
    },
    cleaningFeePaise: Number,
    securityDepositPaise: Number,
    taxPercent: Number,
  },
  { _id: false },
);

const PricingSchema = new Schema(
  {
    basePaise: Number,
    extraPaxPaise: Number,
    eventPaise: Number,
    addOnPaise: Number,
    taxPaise: Number,
    totalPaise: Number,
    quoteOnlyAddOns: [String],
    snapshot: PricingSnapshotSchema,
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    gateway: { type: String, enum: ["razorpay", "external"], default: "razorpay" },
    paymentPlan: { type: String, enum: ["full", "deposit"], default: "full" },
    orderId: String,
    orderIds: [String],
    paymentId: String,
    processedPaymentId: String,
    amountDuePaise: Number,
    depositPaise: Number,
    depositPaidPaise: { type: Number, default: 0 },
    balancePaise: Number,
    balanceDueDate: String,
    externalPaymentRef: String,
    refundedPaise: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "deposit_paid",
        "failed",
        "refunded",
        "partially_refunded",
        "external",
        "not_applicable",
      ],
      default: "pending",
    },
  },
  { _id: false },
);

const BookingSchema = new Schema(
  {
    villaId: { type: Schema.Types.ObjectId, ref: "Villa", required: true },
    bookingType: {
      type: String,
      enum: ["stay", "day_out", "event"],
      default: "stay",
    },
    guestDetails: {
      name: String,
      email: String,
      phone: String,
    },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, default: 1 },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    pets: { type: Number, default: 0 },
    eventType: String,
    eventGuests: Number,
    eventTierId: String,
    eventStartDate: String,
    eventEndDate: String,
    addOns: [AddOnLineSchema],
    pricing: PricingSchema,
    payment: PaymentSchema,
    bookingToken: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "on_hold", "confirmed", "cancelled", "expired", "conflict"],
      default: "pending",
    },
    expiresAt: Date,
    stayStatus: {
      type: String,
      enum: ["upcoming", "in_house", "departed", "turnover", "ready"],
      default: "upcoming",
    },
    source: {
      type: String,
      enum: [
        "website",
        "axisrooms_airbnb",
        "axisrooms_booking_com",
        "admin_manual",
      ],
      default: "website",
    },
    axisRoomsSynced: { type: Boolean, default: false },
    axisRoomsCancelSynced: { type: Boolean, default: true },
    axisRoomsSyncAttempts: { type: Number, default: 0 },
    axisRoomsLastError: String,
    axisRoomsReservationId: String,
    notes: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

BookingSchema.index(
  { "payment.processedPaymentId": 1 },
  { unique: true, partialFilterExpression: { "payment.processedPaymentId": { $exists: true, $type: "string" } } },
);

export type BookingDoc = InferSchemaType<typeof BookingSchema>;
export const BookingModel = models.Booking ?? model("Booking", BookingSchema);
