/**
 * Seed villas from canonical-portfolio.json (sourced from Jade_Property_Data.md).
 *
 * Usage: node scripts/seed-villas.mjs
 */

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MD_PATH = path.join(
  process.cwd(),
  "src/Jade Property Data/Jade_Property_Data.md",
);
const PORTFOLIO_PATH = path.join(
  process.cwd(),
  "src/data/villas/canonical-portfolio.json",
);

const CONFLICT_PATTERN = /\[(CONFLICT|TBD|TO BE FILLED|TO BE CONFIRMED)\]/i;

function rp(rupees) {
  return Math.round(rupees * 100);
}

function seedDoc(v) {
  const hasPricing = v.basePriceRupees > 0;
  return {
    slug: v.slug,
    retreatId: v.retreatId,
    name: v.name,
    shortName: v.shortName,
    type: v.type,
    location: v.location,
    thumbnail: v.thumbnail,
    portfolioSource: v.portfolioSource,
    basePricePaise: hasPricing ? rp(v.basePriceRupees) : 0,
    dayOutBasePricePaise: hasPricing ? rp(v.dayOutBasePriceRupees) : 0,
    stayBasePax: v.stayBasePax,
    dayOutBasePax: v.dayOutBasePax,
    stayMaxPax: v.stayMaxPax,
    extraPaxStayPaise: rp(v.extraPaxStayRupees),
    extraPaxDayOutPaise: rp(v.extraPaxDayOutRupees),
    weddingVenue: v.weddingVenue,
    weddingTiers: (v.weddingTiers ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      mode: t.mode,
      maxGuests: t.maxGuests,
      pricePaise: rp(t.priceRupees),
      stayIncludedPax: t.stayIncludedPax ?? 0,
    })),
    addOnAvailability: v.addOnAvailability ?? [],
    displayStats: v.stats ?? {},
    settings: {
      taxPercent: 18,
      cleaningFeePaise: 0,
      securityDepositPaise: 0,
      cancellationPolicy: "[TO BE CONFIRMED]",
      checkInTime: "14:00",
      checkOutTime: "11:00",
    },
    bookable: v.bookable && hasPricing,
    status: v.status ?? "active",
    isDeleted: false,
  };
}

async function main() {
  if (!MONGODB_URI) {
    console.error("BLOCKED: MONGODB_URI not set");
    process.exit(1);
  }

  if (!fs.existsSync(PORTFOLIO_PATH)) {
    console.error("BLOCKED: canonical-portfolio.json not found");
    process.exit(1);
  }

  if (fs.existsSync(MD_PATH)) {
    const md = fs.readFileSync(MD_PATH, "utf8");
    if (CONFLICT_PATTERN.test(md)) {
      console.warn(
        "NOTE: Jade_Property_Data.md still has [CONFLICT]/[TBD] on specs.",
      );
      console.warn(
        "Seeding portfolio from canonical-portfolio.json (confirmed pricing/capacity).",
      );
      console.warn(
        "Resolve spec conflicts in the MD when the property team confirms.\n",
      );
    }
  }

  const { villas } = JSON.parse(fs.readFileSync(PORTFOLIO_PATH, "utf8"));
  const bookable = villas.filter((v) => v.bookable && v.basePriceRupees > 0);

  usePublicDnsForMongo();
  await mongoose.connect(MONGODB_URI);
  const Villa =
    mongoose.models.Villa ??
    mongoose.model(
      "Villa",
      new mongoose.Schema({}, { strict: false, timestamps: true }),
    );

  for (const raw of villas) {
    const doc = seedDoc(raw);
    await Villa.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true });
    const flag = doc.bookable ? "bookable" : doc.status;
    console.log(`Seeded ${doc.slug} (${flag})`);
  }

  console.log(
    `\nTotal: ${villas.length} properties (${bookable.length} bookable online).`,
  );
  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
