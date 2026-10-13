# Jade Hospitainment — Property Data (canonical)

> Source: `Jade_Hospitainment_Property_Portfolio_v33.docx`. This file is the **single data source** for the villas seed and the public listings. It carries operational data only (identity, pricing, capacity, specs, location, amenities, add-ons). The original docx is preserved in the external cleanup archive. Full marketing prose (Visual Walkthrough, Sales Pitch) stays in that document and can be folded in per property if this `.md` is also to drive public page copy.
>
> **Rules:** All money below is in **rupees** for human reading — the seed must convert to **paise** via `rupeesToPaise()`. All prices are **+ 18% GST** unless a GST-inclusive figure is given. Fields marked `[TBD]` or `[CONFLICT]` MUST be confirmed by the property team before seeding — the seed must **fail loudly** on a missing required field, never default to a placeholder.

---

## Global pricing rules (apply to every property)

- **GST:** 18% on all bookings. Invoices/folio show `GST (18%)` + GSTIN.
- **Extra-pax (stay):** base rate covers the stay base pax; **+₹2,000 / head** beyond base.
- **Extra-pax (day-out / social outing):** day-out base rate covers the day-out base pax; **+₹1,000 / head** beyond base.
- **Three booking products:** `stay` (per night), `day_out` (single day, no overnight), `event` (wedding/function — half-day or full-day, guest-band priced, only at flagged venues). A `stay` may also attach an `event`.
- **Wedding stay-inclusion:** stay capacity listed in a wedding tier is included **only** with the full-day package. Catering, décor, entertainment, custom experiences are charged separately.

## Add-on catalog (server-side; never client-priced)

**Flat add-ons (fixed paise):**
- Picnic setup — ₹4,000
- Floating breakfast — ₹4,000 (up to 5 pax)
- Rooftop jacuzzi — ₹4,000 *(Jade 735 only)*

**Per-person add-ons (min 5 pax):**
- High Tea — ₹150 / person
- 2-Starter BBQ — ₹360 / person
- 4-Starter BBQ — ₹720 / person
- Standard Lunch / Dinner — ₹650 / person
- Standard BBQ Lunch / Dinner — ₹650 / person
- Extra biryani — ₹300 / person

**Quote-only (NOT auto-charged; excluded from payable total, flag for manual follow-up):**
- Culinary Experience — price on request
- Any experience marked "subject to confirmation based on group size"

**Complimentary — included free, NEVER billed (do not list as paid add-ons):**
- Breakfast (1 item from menu + bread/butter/omelette/jam, seasonal cut fruits, tea/coffee)
- BBQ stand (self-use), bonfire, plug-and-play speakers
- Indoor & outdoor games, lawn projector movie night

> Meal pricing may vary by market/ingredient availability; add-on menu items require a minimum of 5 guests; custom menus on request; full food menu is a separate PDF.

---

# Properties

## 1. Magnolia by Jade
- **Type:** Contemporary glass house villa · **Location:** Kanakapura Road; ~20 min from Art of Living Centre, opposite Pyramid Valley
- **Bedrooms:** `[CONFLICT]` title says "4 Bedroom" vs body "3 bedrooms + 1 family room (5 beds total)" — confirm canonical
- **Stay base:** 12 · **Stay extended:** 30–40 *(doc typo "40–30")* · **Day-out base:** 24
- **Event capacity:** lawn seated 100–150 (round) / up to 300 (theatre); floating up to 500–1,000
- **Specs:** plot 1 acre · built-up 4,800 sq ft · pool 21×40 ft (3.5–5.5 ft) · lawn 21,000 sq ft · bathrooms `[5 attached + 4 poolside — confirm]` · parking `[CONFLICT]` 25 cars vs 200–300
- **Pricing (stay):** **₹54,000** + GST (≤12 stay / ≤24 day-out); extra pax +₹2,000 stay / +₹1,000 day-out
- **Wedding venue: YES**
  - Intimate / functions, half-day (50–80): ₹1,00,000 (₹1,18,000 incl GST)
  - Wedding, half-day (≤300): ₹1,45,000 (₹1,71,100)
  - Wedding, full-day (≤300): ₹2,00,000 (₹2,36,000) — incl 20-guest stay
- **Key amenities:** private pool, poolside bar/lounge/patio, 8-seater home theatre, multipurpose hall (conference / dorm), 21,000 sq ft event lawn, basketball court, outdoor lounges
- **Distances:** Airport `[77 km]` · Kanakapura/NICE jn `[6–10 km]` · Electronic City `[38 km]` · Forum Koramangala `[47 km]` · Whitefield `[60 km]` · Majestic `[42 km]`

## 2. Tranquil Woods by Jade
- **Type:** 6-bedroom estate (2-BR glasshouse + 4 garden-view suites) · **Location:** 5 min Art of Living, 20 min Forum Mall
- **Stay base:** 15 · **Stay extended:** `[TBD]` · **Day-out base:** 30
- **Event capacity:** lawn seated 300; floating 500–1,000; open-air hall 100–120 seated
- **Specs:** plot 2 acres · built-up 6,000 sq ft · adult pool 16×30 ft (3.5–5 ft) · kids' pool `[TBD dims]` · lawn `[CONFLICT]` "1.3 acre / ~56,000 sq ft" vs garden "50,000 sq ft" · bathrooms `[7]` · parking `[5–6 inside / 200–300 outside]`
- **Pricing (stay):** **₹66,000** + GST (≤15 / ≤30 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: YES**
  - Intimate / functions, half-day (50–80): ₹1,20,000 (₹1,41,600)
  - Wedding, half-day (≤300): ₹1,75,000 (₹2,06,500)
  - Wedding, full-day (≤300): ₹2,50,000 (₹2,95,000) — incl 20-guest stay
- **Key amenities:** glasshouse living room, adult + kids pools, outdoor amphitheatre, kids' play area, gazebos, open-air dining hall, 50,000+ sq ft multi-level gardens
- **Distances:** Airport `[62 km]` · Electronic City `[23 km]` · Kanakapura/NICE `[20 km]` · Majestic `[27 km]` · Whitefield `[46 km]`

## 3. Emerald by Jade
- **Type:** 2-bedroom heritage villa — `[CONFLICT]` subtitle flips between "Heritage Glass Villa" / "Heritage Rustic Farmhouse" / traditional Indian; confirm · **Location:** 5 min Embassy Riding School, 35 min Hebbal
- **Stay base:** 6 · **Stay extended:** 8 · **Day-out base:** 16 · **Event extended:** 25–30
- **Specs:** plot `[1 acre]` · built-up `[2,016 sq ft]` · pool 16×30 ft (3.5–5 ft) + 8-ft waterfall · garden 2,800 sq ft · bathrooms `[2]` · parking `[5–10]`
- **Pricing (stay):** **₹32,000** + GST (≤6 / ≤16 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** sky-lit central courtyard, aqua-blue pool with waterfall, 2 BR with private garden exits, farm-to-table butler dining, semi-open gazebo
- **Distances:** Airport `[23 km / 30 min]` · Manyata `[33 km]` · Forum `[43 km]` · Whitefield `[57 km]` · Electronic City `[56 km]` · Majestic `[36 km]`

## 4. Dome Villas by Jade — Blue Dome
- **Type:** Duplex dome villa, 3 BR / 3 bath · **Location:** Doddaballapur, ~30 min airport toll gate · **Cluster parking:** `[CONFLICT]` 20–25 cars (narrative) vs 20–30 cars (specs table) — confirm · **Combined cluster event cap:** ~30–35 pax
- **Stay base:** 8 · **Day-out base:** 16 · living-room capacity `[TBD]`
- **Specs:** plot `[2 acre]` · built-up `[1,062 sq ft]` · plunge pool 13×10 ft (5 ft) · lawn 1,160 sq ft
- **Pricing (stay):** **₹37,000** + GST (≤8 / ≤16 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** patio sit-out (hill/paddy views), private plunge pool, outdoor dining, hobbit-hole windows, shared cluster stage

## 5. Dome Villas by Jade — Red Dome
- **Type:** Single-level dome villa, 3 BR / 3 bath (family-friendly, no stairs) · **Location:** Doddaballapur cluster
- **Stay base:** 8 · **Day-out base:** 16
- **Specs:** plot `[2 acre]` · built-up `[1,872 sq ft]` · plunge pool 15×15 ft (5 ft) + kids' pool (2–3 ft, `[dims TBD]`) · lawn 1,650 sq ft
- **Pricing (stay):** **₹35,000** + GST (≤8 / ≤16 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** plunge pool + dedicated kids' pool, outdoor dining, landscaped lawn, shared cluster stage

## 6. Dome Villas by Jade — Yellow Dome
- **Type:** Hillside dome villa with Greek-style bath, 3 BR / 2 bath · **Location:** Doddaballapur cluster (closest to hills)
- **Stay base:** 8 · **Day-out base:** 16
- **Specs:** plot `[2 acre]` · built-up `[3,016 sq ft]` · terrace Greek bath 9×10 ft (4 ft) · lawn 1,040 sq ft · parking `[TBD]`
- **Pricing (stay):** **₹33,000** + GST (≤8 / ≤16 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** Greek-style terrace bath, open-to-sky courtyard, outdoor dining + dry kitchen, best hill views in cluster

## 7. Retreat on the Ridge by Jade
- **Type:** 4-bedroom hillside villa · **Location:** near Varalakonda Hill; 30 min Nandi Hills, 50 min airport toll
- **Stay base:** 10 · **Stay extended:** 18 · **Day-out base:** 20 · **Event:** lawn floating 20–40, total `[40]`
- **Specs:** plot 1 acre · built-up `[CONFLICT]` "1,840 sq ft villa / 5,000 sq ft total" vs intro "5,000 sq ft villa" · pool 29×17 ft (5 ft) + waterfall + Buddha · lawn 2,990 sq ft · bathrooms `[4]` · parking `[6–8]`
- **Pricing (stay):** **₹40,000** + GST (≤10 / ≤20 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** pool with waterfall + Buddha, hill-view gazebo, backyard fire pit, poolside bar, sunset terrace; near lakes & Gudibanda Fort
- **Distances:** Airport toll 50 min · Nandi Hills 30 min · Gudibanda Fort `[9 km / 20 min]` · Hebbal `[77 km]` · Manyata `[75 km]` · Forum `[89 km]` · Whitefield `[87 km]` · Majestic `[80 km]`

## 8. Lemon Tree by Jade
- **Type:** 3-bedroom farmstay with rooftop pool · **Location:** 25 min IKEA; inside a lemon & areca-nut plantation
- **Stay base:** 10 · **Stay extended:** 20–25 · **Day-out base:** 20 · **Event:** up to 50–60
- **Specs:** plot `[CONFLICT]` "2 acres" vs "3-acre plantation" · built-up 5,000 sq ft (three-storey) · rooftop pool 30×22 ft (4–5 ft) · bathrooms `[6]` · parking `[8–10]`
- **Pricing (stay):** **₹31,000** + GST (≤10 / ≤20 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Key amenities:** rooftop pool + sit-out, multipurpose hall (library / games / bar), badminton/archery/darts, plantation walk, bonfire/BBQ/camping
- **Distances:** IKEA 25 min · Airport `[59 km]` · Hebbal `[37 km]` · Yelahanka `[46 km]` · Nandi Hills `[65 km]` · Forum `[44 km]` · Majestic `[35 km]` · Whitefield `[58 km]`

## 9. Haven by Jade
- **Type:** 5-bedroom pool villa (race-track view) · **Location:** 10 min Byg Brewski, Hennur; beside Meco Kartopia
- **Stay base:** 12 · **Stay extended:** 25 · **Day-out base:** 24 · **Event:** lawn seated 100–150, floating 100–800
- **Specs:** plot 1 acre · built-up 3,500 sq ft · pool 14×22 ft (5 ft, race-track view) · lawn 17,600 sq ft + stage `[15×22 ft]` · bathrooms `[7]` · parking `[6–8]`
- **Pricing (stay):** **₹45,000** + GST (≤12 / ≤24 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: YES**
  - Intimate / functions, half-day (50–80): ₹1,00,000 (₹1,18,000)
  - Wedding, half-day (≤300): ₹1,45,000 (₹1,71,100)
  - Wedding, full-day (≤300): ₹2,00,000 (₹2,36,000) — incl 20-guest stay
- **Key amenities:** jacuzzi suite with skylit bath, 75" TV + stereo, pool table, massage chair, event stage; Meco Kartopia + paintball adjacent (booked separately, not included)
- **Distances:** Byg Brewski 10 min · Meco Kartopia adjacent · **all others `[TBD]`** (airport, Hebbal, Manyata, Forum, Whitefield, Majestic)

## 10. Diamond Pavilion by Jade
- **Type:** 9-bedroom estate for large-scale events · **Location:** Kanakapura Road, 10 min Art of Living, 20 min Forum
- **Stay base:** 20 · **Stay extended (dorm):** up to 70 · **Day-out base:** 40 · **Event:** lawn seated 200–400 (theatre) / 100–200 (round); floating up to 2,000
- **Rooms:** 4 double + 4 triple + 1 quad + dormitory hall · **dorm capacity `[CONFLICT]`** 20 vs 50 vs 20–30 (intro 50→70, walkthrough/hall capacity 20, Capacity & Occupancy table 20–30); confirm — drives event pricing · **floors `[CONFLICT]`** 3 vs 4
- **Specs:** plot `[CONFLICT]` "50,000 sq ft" (intro) vs "2 acres" (specs/pitch) · built-up 10,000 sq ft · infinity pool 45×30 ft (5 ft) · lawn 1 acre · bathrooms `[12]` · parking `[500–600]`
- **Pricing (stay):** **₹85,000** + GST (≤20 / ≤40 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: YES**
  - Intimate / functions, half-day (100–150): ₹1,40,000 (₹1,65,200)
  - Wedding, half-day (≤600): ₹2,20,000 (₹2,59,600)
  - Wedding, full-day (≤600): ₹3,00,000 (₹3,54,000) — incl 30-guest stay
- **Key amenities:** infinity pool + loungers, gazebo, 1-acre event lawn, dorm hall, indoor entertainment (TVs/sound/pool table/board games), outdoor games
- **Distances:** Art of Living 10 min · Forum 20 min · Airport `[62 km]` · Electronic City `[23 km]` · Kanakapura/NICE `[20 km]` · Majestic `[27 km]` · Whitefield `[46 km]`

## 11. Jade 735 by Jade
- **Type:** 4-bedroom Balinese villa with private pool + rooftop jacuzzi · **Location:** Sadahalli, gated community, 5 min Airport Toll Gate
- **Stay base:** 10 · **Day-out base:** 20 · **Event:** NA
- **Restrictions:** family groups only · max 10 guests · no loud parties · advance ID mandatory · max 2.2 L liquor · 2 cars at villa (extra via Club Cabana valet) · OTP entry
- **Specs:** plot `[7,000 sq ft]` · built-up `[5,000 sq ft]` · pool size `[TBD]` (depth field is mislabeled "[20×30 ft]" — that is the pool size, not depth) · small lawn
- **Pricing (stay):** **₹45,000** + GST (≤10 / ≤20 day-out); extra pax +₹2,000 / +₹1,000
- **Wedding venue: NO**
- **Paid add-on (property-specific):** rooftop jacuzzi ₹4,000
- **Key amenities:** waterfall pool, poolside lounge + bar, 6-seater rooftop jacuzzi, swinging bed, 65" TV, mist-walkway entrance, semi-open living/dining/kitchen
- **Distances:** Airport Toll 5 min · Airport 15 min (12 km) · Club Cabana 2 min · Hebbal 25 min · Manyata 30 min · Yelahanka 20 min · MG Road 45 min · Forum 50 min · Electronic City 60 min · Whitefield 60 min

## (Excluded) Royalty by Jade
- 5-bedroom villa with private horse ranch — **CURRENTLY NON-FUNCTIONAL.** Listed in the portfolio index but has no documented section, capacity, or pricing. **Exclude from bookable inventory** (or mark "coming soon", `bookable: false`) until activated and documented.

---

# Data conflicts & gaps to confirm before seeding

These block a correct seed because capacity drives extra-pax and event pricing. The property team must resolve them — do not invent values.

- **Magnolia:** bedroom count (4 BR vs 3 BR + family room); parking (25 vs 200–300); extra-bed capacity typo (40–30 → 30–40); base 12 vs sales-pitch "25–30"; bathrooms unconfirmed.
- **Emerald:** subtitle (Glass Villa vs Rustic Farmhouse vs traditional Indian).
- **Tranquil Woods:** extended stay capacity blank; kids' pool dims blank; lawn area (1.3 acre vs 50,000 sq ft garden).
- **Blue Dome:** living-room seated/floating capacity blank; cluster parking (20–25 narrative vs 20–30 specs table).
- **Yellow Dome:** parking blank; confirm 3 BR / 2 bath.
- **Retreat:** villa built-up (1,840 vs 5,000 sq ft); lawn seated typo (15–10 → 10–15).
- **Lemon Tree:** plot (2 vs 3 acres); confirm three-storey vs floor descriptions.
- **Haven:** every driving distance except Byg Brewski / Meco Kartopia is blank.
- **Diamond Pavilion:** site area (50,000 sq ft vs 2 acres); building floors (3 vs 4); **dorm capacity (20 vs 50 vs 20–30) and total (70)** — three different figures across intro/walkthrough/capacity table, confirm; it drives the event price band.
- **Jade 735:** pool size blank; depth field holds the dimensions (mislabeled); BHK title bracketed.
- **Global:** strip authoring brackets `[ … ]` from all capacity figures before publishing — many are unconfirmed estimates.
- **Out of scope (by design):** itemized meal-plan inclusions (e.g. what's in a Standard Lunch/BBQ package) and full marketing-prose amenity detail (e.g. Jade 735's mist-walkway, mirror feature, bar counter) live only in the docx; this `.md` carries add-on pricing and condensed amenity summaries only. Pull from the docx directly if a menu PDF or full-prose listing page needs to be built.
