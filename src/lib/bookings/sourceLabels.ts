export type BookingSource =
  | "website"
  | "admin_manual"
  | "axisrooms_airbnb"
  | "axisrooms_booking_com"
  | string;

export function formatBookingSource(source?: BookingSource): {
  label: string;
  shortLabel: string;
  channel: "direct" | "staff" | "ota";
} {
  switch (source) {
    case "website":
      return {
        label: "Direct — jadehospitainment.com",
        shortLabel: "Direct booking",
        channel: "direct",
      };
    case "admin_manual":
      return {
        label: "Staff manual — calendar hold",
        shortLabel: "Staff manual",
        channel: "staff",
      };
    case "axisrooms_airbnb":
      return {
        label: "OTA — Airbnb (via Axis Rooms)",
        shortLabel: "Airbnb OTA",
        channel: "ota",
      };
    case "axisrooms_booking_com":
      return {
        label: "OTA — Booking.com (via Axis Rooms)",
        shortLabel: "Booking.com OTA",
        channel: "ota",
      };
    default:
      return {
        label: source ? source.replace(/_/g, " ") : "Unknown source",
        shortLabel: source ?? "Unknown",
        channel: "direct",
      };
  }
}
