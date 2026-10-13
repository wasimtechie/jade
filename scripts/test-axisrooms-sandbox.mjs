/**
 * Smoke-test Axis Rooms sandbox APIs 1, 2, 6, 7 (per Axis onboarding order).
 *
 * Usage: npm run axis:test
 * Requires AXIS_ROOMS_* in .env.local and seed-axis-sandbox mapping.
 */

import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { assertAxisSandbox } from "./assert-axis-sandbox.mjs";

loadEnvLocal();

const base = (process.env.AXIS_ROOMS_API_BASE_URL ?? "https://sandbox2.axisrooms.com").replace(
  /\/$/,
  "",
);
assertAxisSandbox(base);
const accessKey = process.env.AXIS_ROOMS_API_KEY?.trim();
const channelId = process.env.AXIS_ROOMS_CHANNEL_ID?.trim() ?? "229";
const hotelId = process.env.AXIS_TEST_HOTEL_ID?.trim() ?? "1234";
const roomId = process.env.AXIS_TEST_ROOM_ID?.trim() ?? "1";
const ratePlanId = process.env.AXIS_TEST_RATE_PLAN_ID?.trim() ?? "1";

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function todayIst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function post(path, body) {
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey, channelId, ...body }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function run(label, path, body) {
  process.stdout.write(`${label} … `);
  const result = await post(path, body);
  const status = String(result.data?.status ?? "").toLowerCase();
  const success =
    result.ok && status !== "failure" && status !== "error";
  console.log(success ? "OK" : `FAIL (${result.status})`);
  if (!success) {
    console.log("  ", JSON.stringify(result.data));
  }
  return success;
}

async function main() {
  if (!accessKey) {
    console.error("BLOCKED: AXIS_ROOMS_API_KEY not set in .env.local");
    process.exit(1);
  }

  const start = addDays(todayIst(), 7);
  const end = addDays(start, 14);
  const price = Number(process.env.AXIS_TEST_PRICE_RUPEES ?? 45000);

  console.log(`\nAxis Rooms sandbox test`);
  console.log(`  Base URL  : ${base}`);
  console.log(`  channelId : ${channelId}`);
  console.log(`  hotelId   : ${hotelId} · room ${roomId} · rate ${ratePlanId}`);
  console.log(`  Dates     : ${start} → ${end}\n`);

  const results = [];

  results.push(
    await run("API 2 bulk inventory", "/api/inventory", {
      hotels: [
        {
          hotelId,
          rooms: [{ roomId, startDate: start, endDate: end, availability: 1 }],
        },
      ],
    }),
  );

  results.push(
    await run("API 1 daywise inventory", "/api/daywiseInventory", {
      hotels: [
        {
          hotelId,
          rooms: [
            {
              roomId,
              availability: [{ date: start, free: 1 }],
            },
          ],
        },
      ],
    }),
  );

  results.push(
    await run("API 7 bulk price", "/api/bulkPriceUpdate", {
      hotels: [
        {
          hotelId,
          rooms: [
            {
              roomId,
              rateplans: [
                {
                  rateplanId: ratePlanId,
                  priceDetails: [
                    {
                      startDate: start,
                      endDate: end,
                      price: { Double: price },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  );

  results.push(
    await run("API 6 daywise price", "/api/daywisePrice", {
      hotels: [
        {
          hotelId,
          rooms: [
            {
              roomId,
              rateplans: [
                {
                  rateplanId: ratePlanId,
                  priceDetails: [
                    { date: start, price: { Double: price } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  );

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} API checks passed.\n`);
  if (passed < results.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
