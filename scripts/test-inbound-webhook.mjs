/**
 * POST a sample API 9 inbound booking to the local webhook.
 *
 * Usage:
 *   npm run axis:inbound-test
 *   node scripts/test-inbound-webhook.mjs --hotel=1303 --room=1 --rate=1
 *   node scripts/test-inbound-webhook.mjs --invalid
 *   node scripts/test-inbound-webhook.mjs --bad-hotel=9999
 */

import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { assertAxisSandbox } from "./assert-axis-sandbox.mjs";

loadEnvLocal();
assertAxisSandbox(process.env.AXIS_ROOMS_API_BASE_URL ?? "");

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const accessKey = process.env.AXIS_ROOMS_API_KEY?.trim();
const baseUrl = (process.env.WEBHOOK_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const invalid = process.argv.includes("--invalid");
const badHotel = arg("bad-hotel", "");

const hotelId = badHotel || arg("hotel", "1303");
const roomId = invalid ? "999" : arg("room", "1");
const ratePlanId = invalid ? "88" : arg("rate", "1");
const noOfRooms = invalid ? "5" : "1";

if (!accessKey) {
  console.error("BLOCKED: AXIS_ROOMS_API_KEY not set");
  process.exit(1);
}

const bookingNo = `ARKSAAD${Date.now().toString(36).toUpperCase().slice(-6)}`;
const checkIn = arg("checkIn", "2026-08-03");
const checkOut = arg("checkOut", "2026-08-04");

const payload = {
  accessKey,
  GuestDetails: {
    title: "Mr",
    guestName: "Mohammed Saad",
    emailId: "saad@helloerrors.in",
    mobileNo: "9876543210",
    countryCode: "+91",
  },
  CheckinDetails: {
    checkInDate: checkIn,
    checkOutDate: checkOut,
    totalPax: "2",
    children: "0",
    supplierAmount: "4350.05",
    taxes: "1123.0",
    totalAmount: "4579.0",
    paid: "false",
    isGeniusBooker: false,
    specialRequest: [],
    amountToBeCollected: "4579.0",
    isDayWisePrice: true,
  },
  BookingDetails: {
    hotelId,
    bookingNo,
    bookingDateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
    bookedBy: "Mohammed Saad",
    ota: "Direct Booking",
    otaRefId: "1",
    bookingStatus: "confirmed",
    bookingSource: "Direct Booking",
    bookingSourceRefId: "",
  },
  Rates: {
    roomType: [
      {
        id: roomId,
        noOfRooms,
        ratePlanId: ratePlanId || "",
        totalAdults: "2",
        ratePlanName: "Best Available Rate",
        cityTax: "NA",
        vat: "NA",
        serviceCharge: "NA",
        dayWiseDetails: [{ date: checkIn, deals: "NA", rate: "4456.0" }],
      },
    ],
  },
};

const modeLabel = badHotel
  ? `BAD HOTEL (${badHotel})`
  : invalid
    ? "INVALID (bad room/rate/noOfRooms)"
    : `VALID (hotel ${hotelId} room ${roomId} rate ${ratePlanId})`;

console.log(`\nPOST ${baseUrl}/api/webhooks/axisrooms`);
console.log(`Mode: ${modeLabel}`);
console.log(`bookingNo: ${bookingNo}`);
console.log(`dates: ${checkIn} → ${checkOut}\n`);

const res = await fetch(`${baseUrl}/api/webhooks/axisrooms`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text?.slice?.(0, 500) ?? text };
}

console.log(`HTTP ${res.status}`);
console.log(JSON.stringify(body, null, 2));

if (!invalid && !badHotel && res.ok && body.status === "success") {
  console.log("\n✓ Valid booking accepted — check logs/axisrooms-inbound.jsonl");
}

if ((invalid || badHotel) && res.status === 422) {
  console.log("\n✓ Invalid payload correctly rejected (422)");
}

process.exit(res.ok ? 0 : badHotel || invalid ? (res.status === 422 ? 0 : 1) : 1);
