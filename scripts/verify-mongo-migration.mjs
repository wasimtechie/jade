/**
 * Post-migration smoke test — villas, users, bookings, GridFS metadata.
 *   node scripts/verify-mongo-migration.mjs
 */
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";

loadEnvLocal();

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15_000 });
const db = mongoose.connection.db;

const checks = [
  ["villas", { isDeleted: { $ne: true } }],
  ["users", {}],
  ["bookings", { isDeleted: { $ne: true } }],
  ["mediaassets", { status: "active" }],
  ["cms-media.files", {}],
];

console.log("\nPost-migration smoke test\n");
let ok = true;

for (const [col, filter] of checks) {
  const n = await db.collection(col).countDocuments(filter);
  const pass = n > 0 || col === "cms-media.files";
  if (!pass) ok = false;
  console.log(`  ${pass ? "OK" : "FAIL"}  ${col}: ${n}`);
}

const villa = await db.collection("villas").findOne({ isDeleted: { $ne: true } });
if (villa?.name) {
  console.log(`  OK  sample villa: ${villa.name}`);
} else {
  console.log("  FAIL  no villa found");
  ok = false;
}

const user = await db.collection("users").findOne({});
if (user?.email) {
  console.log(`  OK  sample user: ${user.email}`);
} else {
  console.log("  FAIL  no user found");
  ok = false;
}

await mongoose.disconnect();
console.log(ok ? "\nSmoke test PASSED\n" : "\nSmoke test FAILED\n");
process.exit(ok ? 0 : 1);
