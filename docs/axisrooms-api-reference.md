# AxisRooms PMS API - Integration Reference (Jade)

> Source: pms.api.axisrooms.com
> Purpose: the working contract for the Jade Hospitainment <-> AxisRooms two-way integration.
> Suggested repo location: `docs/axisrooms-api-reference.md`

---

## 1. What AxisRooms is

AxisRooms is a **Channel Manager (CM)**. It sits between your PMS (Jade) and the OTAs (Airbnb, Booking.com, etc.). Jade never talks to the OTAs directly - it talks to AxisRooms, and AxisRooms relays to the OTAs.

The integration has **three directions**. Knowing the direction of each endpoint is the single most important thing:

| Direction | Meaning | Who hosts the endpoint |
| --- | --- | --- |
| **OUTBOUND** (Jade -> AxisRooms) | You push availability (inventory) and prices. Calls **you make**. | AxisRooms |
| **INBOUND** (AxisRooms -> Jade) | A guest books on an OTA; AxisRooms POSTs that booking to **you**. | **You build this** |
| **READ** (Jade -> AxisRooms) | Optional calls to verify state or pull bookings as a backup. | AxisRooms |

There is exactly **one endpoint Jade hosts**: the inbound booking receiver (API 9). Everything else is a call Jade makes.

---

## 2. Authentication

- Auth is a single shared **`accessKey`** (alphanumeric), sent **inside the JSON body** of every request. There is **no** `Authorization` / Bearer header.
- AxisRooms provides this key; it is released once integration is complete. There may be a different key per environment.
- A wrong key returns HTTP **401**.
- On the **inbound** call (API 9), AxisRooms includes `accessKey` in the body it sends you. Your endpoint must validate it against your stored key (timing-safe compare).

```json
{ "accessKey": "clientAPIKey" }
```

### Jade environments

| Environment | Base URL | Channel | Status |
| --- | --- | --- | --- |
| Sandbox (Jul 2026) | `https://sandbox2.axisrooms.com` | 227 | Retired |
| Preprod UAT (22 Sep 2026) | `https://preprod1.axisrooms.com` | 229 | Passed — hotel `1234`, rooms/rates `1`, `2` |
| **Production** | `https://app.axisrooms.com` | 229 (awaiting reconfirmation) | Ten supplied mappings applied locally on 13 Oct 2026; integration paused pending production credentials |

Environment and deployment requirements: [`DEPLOYMENT.md`](../DEPLOYMENT.md). Sandbox smoke test: `npm run axis:test`. Map a sandbox villa: `npm run axis:seed`.

Production mappings are maintained in `src/data/axisrooms/production-mappings.json`. Kintsugi is skipped at the user's request. `npm run axis:configure:production` previews changes; add `-- --apply` to apply them to the configured database without making Axis API requests. Known old synthetic mappings on other villas are retired; those properties await confirmed production IDs.

`AXIS_ROOMS_ENABLED=false` pauses inbound booking receipt and outbound API calls while credentials are being confirmed. Once the production access key and channel ID are confirmed, configure them securely and enable the integration. Sandbox seeding, rate/inventory smoke tests, and synthetic webhook tests reject the production URL.

### Sandbox base URL pattern (generic)

All AxisRooms-hosted endpoints look like:

```
https://sandboxE.axisrooms.com/api/...
```

`E` is an **environment number** (1, 2, 3, ...) that AxisRooms assigns. **Ask the AxisRooms tech team for the number.** The docs mix `http://` and `https://` - always use **https**. Read the base URL from an env var; never hardcode.

---

## 3. Identifiers (you define most of these)

| ID | Where it lives | Notes |
| --- | --- | --- |
| `accessKey` | provided by AxisRooms | secret, in body |
| `channelId` / `pmsId` | provided by AxisRooms | **same value, two different field names.** `pmsId` is used in APIs 3, 4, 13, 14; `channelId` everywhere else. |
| `hotelId` | Axis production mapping | use the supplied hotel ID for the matching villa. |
| `roomId` | Axis production mapping | use the supplied room ID; a villa is one whole unit. |
| `rateplanId` | Axis production mapping | use the supplied rate plan ID. |
| `otaId` / `otaRefId` | provided by AxisRooms | integer id per OTA (e.g. which number is Booking.com vs Airbnb). **Get the OTA id list from AxisRooms.** |

---

## 4. Endpoint summary (all 15)

| # | Name | Direction | Method + path (sandbox) | Jade |
| --- | --- | --- | --- | --- |
| 1 | Inventory Update (day-wise) | OUTBOUND | POST `/api/daywiseInventory` | **CALL (core)** |
| 2 | Bulk Inventory Update | OUTBOUND | POST `/api/inventory` | **CALL (core)** |
| 3 | Block Channel Inventory | OUTBOUND | POST `/api/blockChannel` | optional |
| 4 | Unblock Channel Inventory | OUTBOUND | POST `/api/unblockChannel` | optional |
| 5 | Fetch Inventory (OTA-wise) | READ | POST `/api/otaAvailability` | verify |
| 6 | Price Update (day-wise) | OUTBOUND | POST `/api/daywisePrice` | **CALL (core)** |
| 7 | Bulk Price Update | OUTBOUND | POST `/api/bulkPriceUpdate` | **CALL (core)** |
| 8 | Fetch Price (OTA-wise) | READ | POST `/api/otaRates` | verify |
| 9 | Bookings Update in Client system | INBOUND | POST `<endpoint you build>` | **BUILD (host it)** |
| 10 | No-Show Enable (Booking.com) | OUTBOUND | POST `/api/bookingNoShowEnable` | optional |
| 11 | Update MLOS | OUTBOUND | POST `/api/updateMlos` | optional |
| 12 | Pull Booking | READ | POST `/api/pullBooking` | backup/reconcile |
| 13 | Get Connected OTAs by channel_id | READ | GET `/api/getConnectedChannel?pmsId=XYZ` | setup check |
| 14 | Update OTA Credentials | OUTBOUND | POST `/api/updateOTACredentials` | config |
| 15 | Update OTA Restrictions (MLOS/CTA/CTD/Open-Close) | OUTBOUND | POST `/api/cm-restrictions` | optional |

Common response shape (most OUTBOUND endpoints):

```json
{ "status": "success/failure", "message": "", "errorCode": "" }
```

---

## 5. Core endpoints - full detail

### API 9 - Bookings Update in Client system  (INBOUND - YOU BUILD THIS)

AxisRooms POSTs this to an endpoint you host whenever a booking happens on an OTA. Confirmations, modifications, and cancellations all arrive here, distinguished by `BookingDetails.bookingStatus`.

**You must reply with exactly:**

```json
{ "status": "success", "message": "Booking Update Received" }
```

If you reply with anything else, AxisRooms treats the push as failed and retries.

Request AxisRooms sends you:

```json
{
  "BookingDetails": {
    "bookedBy": "test test",
    "bookingDateTime": "2019-06-20 12:33:27",
    "bookingNo": "ARK00000USEP",
    "bookingSource": "AxisRooms",
    "bookingSourceRefId": "",
    "bookingStatus": "confirmed",
    "hotelId": "DIHRAY",
    "ota": "AxisRooms",
    "otaRefId": "1"
  },
  "CheckinDetails": {
    "amountToBeCollected": "",
    "checkInDate": "2019-06-21",
    "checkOutDate": "2019-06-22",
    "children": "0",
    "isDayWisePrice": true,
    "isGeniusBooker": false,
    "paid": "false",
    "specialRequest": [],
    "supplierAmount": "1108.23",
    "taxes": "55.55",
    "totalAmount": "1166.55",
    "totalPax": "2"
  },
  "GuestDetails": {
    "countryCode": "",
    "emailId": "guest@example.com",
    "guestName": "test test",
    "mobileNo": "7842842078",
    "title": ""
  },
  "Rates": {
    "roomType": [
      {
        "cityTax": "NA",
        "dayWiseDetails": [
          { "date": "2019-06-21", "deals": "NA", "rate": "1111.0" }
        ],
        "id": "SR",
        "noOfRooms": "1",
        "ratePlanId": "BAR",
        "ratePlanName": "RO",
        "serviceCharge": "NA",
        "totalAdults": "2",
        "vat": "NA"
      }
    ]
  },
  "accessKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

Key fields:

| Field | Meaning |
| --- | --- |
| `bookingNo` | unique booking id. Use as the dedup / reference key. |
| `bookingStatus` | `confirmed` / `modified` / `cancelled`. Branch on this. |
| `hotelId` | YOUR property id -> look up the villa by it. |
| `ota` | OTA name (e.g. "Booking.com", "Airbnb"). Maps to the booking source. |
| `checkInDate` / `checkOutDate` | `yyyy-MM-dd`. |
| `totalPax` | total adults. `children` is separate. |
| `totalAmount` / `taxes` | **decimal rupee strings** (e.g. "1166.55"). |
| `guestName` / `emailId` / `mobileNo` | guest contact. |
| `Rates.roomType[]` | OTA-specific. Fields AxisRooms does not get from the OTA come through as the literal string **`"NA"`** - parse defensively. |

> Note from AxisRooms: API 9 is a **sample, subject to change** to fit the partner. Ask for one real confirmed payload and one real cancelled payload before final hardening. Keep all field extraction in one parser module so the contract lives in one place.

---

### API 1 - Inventory Update, day-wise  (OUTBOUND)

Push availability per room per date. For a whole-unit villa, `free` is `1` (open) or `0` (booked).

`POST https://sandboxE.axisrooms.com/api/daywiseInventory`

```json
{
  "accessKey": "clientAPIKey",
  "channelId": "AxisRoomsClientId",
  "hotels": [
    {
      "hotelId": "H-01",
      "rooms": [
        {
          "roomId": "DLX",
          "availability": [
            { "date": "2018-04-13", "free": 1 },
            { "date": "2018-04-14", "free": 1 }
          ]
        }
      ]
    }
  ]
}
```

Dates: `yyyy-MM-dd`. Supports multiple hotels/rooms in one call.

---

### API 2 - Bulk Inventory Update  (OUTBOUND)

Set one availability number across a date range.

`POST https://sandboxE.axisrooms.com/api/inventory`

```json
{
  "accessKey": "clientAPIKey",
  "channelId": "AxisRoomsClientId",
  "hotels": [
    {
      "hotelId": "HT-01",
      "rooms": [
        { "roomId": "DLX", "startDate": "2018-04-30", "endDate": "2018-12-31", "availability": 5 }
      ]
    }
  ]
}
```

---

### API 6 - Price Update, day-wise  (OUTBOUND)

Push prices per rate plan per date. **`Double` (double-occupancy) price is mandatory.** Occupancy tiers `Double..Ten` are the total price at that occupancy; `Extra Bed/Child/Adult/Infant` are per-head add-ons. Pick one convention - do not double-count tiers and extras.

`POST https://sandboxE.axisrooms.com/api/daywisePrice`

```json
{
  "accessKey": "clientAPIKey",
  "channelId": "AxisRoomsClientId",
  "hotels": [
    {
      "hotelId": "HT-01",
      "rooms": [
        {
          "roomId": "DLX",
          "rateplans": [
            {
              "rateplanId": "RP-1",
              "priceDetails": [
                {
                  "date": "2018-04-25",
                  "otaIds": [2, 5],
                  "price": {
                    "Double": 2000,
                    "Single": 2000,
                    "Triple": 2500,
                    "Quad": 3000,
                    "Extra Bed": 500,
                    "Extra Child": 200,
                    "Extra Adult": 500,
                    "Extra Infant": 150
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

`otaIds` is optional. Omit it to push the same price to all OTAs; include it to price per OTA. Occupancy tiers above `Quad` (`Penta`..`Ten`) and the extra-person fields are all optional except `Double`.

---

### API 7 - Bulk Price Update  (OUTBOUND)

Same as API 6 but with `startDate`/`endDate` instead of a single `date`, and `otaIds` at the rateplan level.

`POST https://sandboxE.axisrooms.com/api/bulkPriceUpdate`

```json
{
  "accessKey": "clientAPIKey",
  "channelId": "AxisRoomsClientId",
  "hotels": [
    {
      "hotelId": "HT-01",
      "rooms": [
        {
          "roomId": "DLX",
          "rateplans": [
            {
              "rateplanId": "RP-1",
              "otaIds": [9, 2, 3],
              "priceDetails": [
                {
                  "startDate": "2018-08-28",
                  "endDate": "2018-04-30",
                  "price": { "Double": 2500, "Single": 2000, "Extra Bed": 500 }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. Read / verify endpoints

### API 5 - Fetch Inventory (OTA-wise)  (READ)

Check what availability AxisRooms holds for an OTA. `POST /api/otaAvailability`

```json
{ "accessKey": "clientAPIKey", "channelId": "AxisRoomsClientId", "otaId": "2",
  "hotelId": "HT-01", "roomId": "DLX", "startDate": "2018-04-23", "endDate": "2018-04-25" }
```

Response includes an `availability` array of `{ date, free }`.

### API 8 - Fetch Price (OTA-wise)  (READ)

Check prices AxisRooms holds for an OTA. `POST /api/otaRates`

```json
{ "accessKey": "clientAPIKey", "channelId": "AxisRoomsClientId", "otaId": "2",
  "hotelId": "HT-01", "roomId": "DLX", "rateplanId": "RP-1",
  "startDate": "2018-04-25", "endDate": "2018-04-26" }
```

Response includes `priceDetails[]` with the occupancy `price` object per date.

### API 12 - Pull Booking  (READ - backup / reconciliation)

Fetch bookings for a hotel over a date window. **Max 10 days per call** - paginate in 10-day windows. Request dates are `dd/MM/yyyy`; response dates are `dd/MM/yyyy HH:mm:ss`. `cancelledDate` appears only for cancelled, `modifiedDate` only for modified.

`POST /api/pullBooking`

```json
{ "accessKey": "clientAPIKey", "channelId": "AxisRoomsClientId",
  "hotelId": "HT-01", "startDate": "21/03/2018", "endDate": "30/03/2018" }
```

The response booking shape is similar to API 9 but uses `dd/MM/yyyy` dates and slightly different field names (`checkInDateTime`, `amount`). Funnel pulled bookings through the same parser + upsert path as API 9 so idempotency dedupes anything already received via push.

### API 13 - Get Connected OTAs by pmsId  (READ - setup check)

`GET /api/getConnectedChannel?pmsId=XYZ` -> list of `{ channelId, channelName }` per hotel. Use to confirm which OTAs are connected and to learn the channel/OTA ids.

---

## 7. Optional / later endpoints

| # | Path | What it does |
| --- | --- | --- |
| 3 | `/api/blockChannel` | Block a room's inventory for a date range on specific OTAs. Body uses `pmsId` + `channelId` (array of OTA ids). |
| 4 | `/api/unblockChannel` | Reverse of block. Uses `pmsId`. |
| 10 | `/api/bookingNoShowEnable` | Mark a Booking.com booking as no-show. Body: `bookingId`, `channelId`, `productId` (= hotelId). (Sample has no `accessKey`.) |
| 11 | `/api/updateMlos` | Set minimum length of stay for MLOS-supported OTAs (Booking.com / Expedia / GoIbibo). `Dow` = days of week, Mon=1. |
| 14 | `/api/updateOTACredentials` | Push OTA login credentials (username/password) per channel. Uses `pmsId`. |
| 15 | `/api/cm-restrictions` | Combined MLOS + restrictions (`resType`: Master/CTA/CTD; `reStatus`: open/close). |

> Doc quirk: the line "client can fetch the booking only for 10 days" is copy-pasted onto APIs 13, 14, and 15 in the source docs. It only truly applies to API 12 (Pull Booking). Ignore it elsewhere.

---

## 8. Gotchas (these break integrations silently)

1. **Auth is in the body, not a header.** Validate `payload.accessKey`. A Bearer-header check will reject every real AxisRooms call.
2. **API 9 response must be exactly** `{"status":"success","message":"Booking Update Received"}` or AxisRooms keeps retrying.
3. **Date formats are inconsistent.** Most endpoints: `yyyy-MM-dd`. Pull Booking (12) request: `dd/MM/yyyy`; its response: `dd/MM/yyyy HH:mm:ss`. API 9 `bookingDateTime`: `yyyy-MM-dd HH:mm:ss`. Format per-endpoint.
4. **`channelId` and `pmsId` are the same value** under two field names (pmsId in 3/4/13/14).
5. **`"NA"` as a literal string** appears across API 9's `roomType` fields. Numeric-looking fields can be `"NA"` - guard before `Number(...)`.
6. **Money in API 9 / 12 is decimal rupee strings** ("1166.55"). Jade stores paise -> `Math.round(Number(x) * 100)`. Guard NaN.
7. **`Double` occupancy price is mandatory** on every price push.
8. **Occupancy tiers vs extra-person**: `Double..Ten` are full prices at that occupancy; `Extra *` are per-head. Choose one model; confirm with AxisRooms how the OTA applies them so you do not double-charge.
9. **Pull Booking caps at 10 days** per call.
10. **All endpoints documented are sandbox.** Production URLs differ - ask AxisRooms.

---

## 9. Error codes

| Code | Meaning |
| --- | --- |
| 400 | Bad request |
| 401 | Unauthorized - wrong API key |
| 403 | Forbidden |
| 404 | URL not found |
| 500 | Internal server error - retry later |
| 503 | Service unavailable |
| 1 | Data parsing error |
| 2 | channel (pms client id) missing |
| 3 | channel (pms client) not mapped |
| 4 | authentication failed |
| 5 | hotel id not mapped |
| 6 | room id not mapped |
| 12 | rate plan id not mapped |

Codes 3, 5, 6, 12 are **mapping problems** - expect these during first sandbox runs until each villa's `hotelId` / `roomId` / `rateplanId` is set up correctly. Surface them as readable log messages.

---

## 10. Jade-specific mapping

### Inbound (API 9 -> Jade `Booking`)

| AxisRooms field | Jade `Booking` field | Transform |
| --- | --- | --- |
| `BookingDetails.bookingNo` | `axisRoomsReservationId` + idempotency key | key = `${bookingNo}:${bookingStatus}` |
| `BookingDetails.bookingStatus` | `status` | confirmed->confirmed, cancelled->cancelled, modified->update existing |
| `BookingDetails.hotelId` | (lookup) -> `villaId` | `Villa.findOne({ "axisRooms.propertyId": hotelId, isDeleted: false })` |
| `BookingDetails.ota` | `source` | "Airbnb"->`axisrooms_airbnb`, "Booking.com"->`axisrooms_booking_com` |
| `CheckinDetails.checkInDate` | `checkIn` | string `yyyy-MM-dd` |
| `CheckinDetails.checkOutDate` | `checkOut` | string `yyyy-MM-dd` (check-out exclusive) |
| `CheckinDetails.totalPax` | `adults`, `guests` | `Number()` |
| `CheckinDetails.children` | `children` | `Number()` |
| `CheckinDetails.totalAmount` | `pricing.totalPaise` | `Math.round(Number(x) * 100)` |
| `CheckinDetails.taxes` | `pricing.taxPaise` | `Math.round(Number(x) * 100)` |
| `GuestDetails.guestName/emailId/mobileNo` | `guestDetails.name/email/phone` | |
| (set) | `bookingType` = `"stay"` | |
| (set) | `payment.gateway` = `"external"`, `payment.status` = `"external"` | OTA collected payment |
| (set) | `axisRoomsSynced` = `true`, `axisRoomsCancelSynced` = `true` | **prevents the retry cron pushing it back (no loopback)** |
| (generate) | `bookingToken` | required + unique, e.g. `axis_${bookingNo}` |

Processing rules:
- **Idempotency:** insert into `WebhookEvent` (`{ eventId, source: "axisrooms" }`, unique on `{eventId, source}`) first; duplicate-key (11000) means already processed -> return success, do nothing.
- **Double-booking:** create the booking inside `withTransaction()` and call `acquireNightLocks()`. On `{ ok:false, conflictDate }`, save the booking with status `conflict` (do not 500, do not drop) so staff see it. Still return success to AxisRooms.
- **Cancel:** find by `axisRoomsReservationId`, cancel, `releaseNightLocks(bookingId)`.

### Outbound (Jade -> AxisRooms)

- When a website/manual booking is confirmed: push inventory for those villa-nights with `free: 0` (API 1). On cancel: `free: 1`.
- Prices: push via API 6/7 from the villa base-occupancy price + per-extra-guest rule, mapped to `Double` + extra-person fields (confirm convention).
- **Never push an AxisRooms-origin booking back** - those are pre-marked `axisRoomsSynced = true`.
- Reuse villa mapping `Villa.axisRooms { propertyId -> hotelId, roomTypeId -> roomId, ratePlanId }`.

### Inventory sync by event (as implemented)

Axis requirement (Rohith, Jul 2026): after every API 9 event, push inventory back with API 2. Only APIs **1, 2, 6, 7, 9** are used; API 5 is not called on inbound.

| Event | Direction | Jade calendar | Push to Axis |
| --- | --- | --- | --- |
| Website / manual booking confirmed | Jade -> CM | Night locks acquired | API 1, remaining units |
| Staff cancel / date change | Jade -> CM | Locks released / swapped | API 1 open old, close new |
| OTA booking confirmed (API 9) | CM -> Jade | Night locks acquired | API 2, remaining units |
| OTA booking modified (API 9) | CM -> Jade | Locks swapped | API 2 open old range, close new |
| OTA booking cancelled (API 9) | CM -> Jade | Locks released | API 2, units restored |
| Calendar block | Jade -> CM | Local block | API 1 |

Jade villas are sold as **whole units** (1 allotment), so "remaining units" is `0` or `1` in production. Check-out is exclusive (15–17 Aug blocks the nights of 15 and 16).

### API 9 validation gate

| Step | Check | On fail |
| --- | --- | --- |
| 1 | `accessKey` matches `AXIS_ROOMS_API_KEY` | 401 |
| 2 | Valid JSON + API 9 structure | 422 |
| 3 | bookingNo, hotelId, dates, roomId, noOfRooms present and valid | 422 |
| 4 | hotelId + roomId + ratePlanId match a mapped villa | 422 |
| 5 | Villa is `channel_managed` | 422 |
| 6 | Duplicate event | 200 (idempotent) |
| 7 | Save booking, then API 2 inventory ack | 200 |

Logs: dashboard -> Axis Rooms -> Sync log (`axisrooms.inbound`, `axisrooms.inventory.bulk`); locally `logs/axisrooms-inbound.jsonl` (set `AXIS_ROOMS_INBOUND_LOG_FILE=false` to skip).

---

## 11. Still needed from AxisRooms

Production hotel, room, and rate plan IDs were supplied on 13 October 2026. Ten matching properties are configured locally; Kintsugi is skipped. The production URL is `https://app.axisrooms.com`; API traffic is paused while credentials are confirmed. Remaining:

1. Confirmation of the production access key and channel ID (currently 229).
2. Production Hotel / Room / Rateplan IDs for any additional properties to be channel managed.
3. The OTA id list (which integer = Airbnb, Booking.com, ...), and a reviewed opening inventory reconciliation before live synchronization.

Current deployment requirements: [`DEPLOYMENT.md`](../DEPLOYMENT.md).
