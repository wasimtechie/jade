/**
 * Seed dashboard users (admin, staff, team, seo, dev) for NextAuth login.
 * Usage: node scripts/seed-users.mjs
 * Password: SEED_USER_PASSWORD env or default JadeHost2026!
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const PASSWORD =
  process.env.SEED_USER_PASSWORD?.trim() || "JadeHost2026!";

const USERS = [
  {
    name: "Jade Admin",
    email: "admin@jadehospitainment.com",
    role: "admin",
  },
  {
    name: "Jade Staff",
    email: "staff@jadehospitainment.com",
    role: "staff",
  },
  {
    name: "Jade Team",
    email: "team@jadehospitainment.com",
    role: "team",
  },
  {
    name: "Jade SEO",
    email: "seo@jadehospitainment.com",
    role: "seo",
  },
  {
    name: "Jade Dev",
    email: "dev@jadehospitainment.com",
    role: "dev",
  },
];

async function main() {
  if (!MONGODB_URI) {
    console.error("BLOCKED: MONGODB_URI not set");
    process.exit(1);
  }

  usePublicDnsForMongo();
  await mongoose.connect(MONGODB_URI);
  const User =
    mongoose.models.User ??
    mongoose.model(
      "User",
      new mongoose.Schema({
        name: String,
        email: { type: String, unique: true },
        passwordHash: String,
        role: {
          type: String,
          enum: ["admin", "staff", "team", "seo", "dev"],
        },
        status: {
          type: String,
          enum: ["active", "suspended"],
          default: "active",
        },
        assignedVillas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Villa" }],
        isDeleted: { type: Boolean, default: false },
      }),
    );

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const u of USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        status: "active",
        isDeleted: false,
      },
      { upsert: true },
    );
    console.log(`Seeded ${u.role}: ${u.email}`);
  }

  console.log(`\nDefault password for all seeded users: ${PASSWORD}`);
  console.log("(Override with SEED_USER_PASSWORD in env)\n");

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
