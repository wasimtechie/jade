export type BookingType = "stay" | "day_out" | "event";

export type BookingStatus =
  | "pending"
  | "on_hold"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "conflict";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "deposit_paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "external"
  | "not_applicable";

export type PaymentPlan = "full" | "deposit";

export type StayStatus =
  | "upcoming"
  | "in_house"
  | "departed"
  | "turnover"
  | "ready";

export interface AddOnLine {
  id: string;
  quantity: number;
}

export interface PricingSnapshot {
  basePricePaise: number;
  dayOutBasePricePaise: number;
  stayBasePax: number;
  dayOutBasePax: number;
  extraPaxStayPaise: number;
  extraPaxDayOutPaise: number;
  chargeableHeadsRule: { childFreeAgeLimit: number; countInfants: boolean };
  eventTier?: {
    id: string;
    label: string;
    mode: "half_day" | "full_day";
    pricePaise: number;
    stayIncludedPax: number;
  };
  cleaningFeePaise: number;
  securityDepositPaise: number;
  taxPercent: number;
}

export interface BookingPricing {
  basePaise: number;
  extraPaxPaise: number;
  eventPaise: number;
  addOnPaise: number;
  taxPaise: number;
  totalPaise: number;
  quoteOnlyAddOns?: string[];
  snapshot: PricingSnapshot;
}

export interface BookingPayment {
  gateway: "razorpay" | "external";
  paymentPlan: PaymentPlan;
  orderId?: string;
  orderIds?: string[];
  paymentId?: string;
  processedPaymentId?: string;
  amountDuePaise: number;
  depositPaise: number;
  depositPaidPaise: number;
  balancePaise: number;
  balanceDueDate?: string;
  externalPaymentRef?: string;
  refundedPaise?: number;
  status: PaymentStatus;
}
