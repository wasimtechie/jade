/**
 * Diagnose staff login — verifies Mongo user + bcrypt against seed password.
 * Usage: node scripts/verify-login.mjs [password]
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

loadEnvLocal();
usePublicDnsForMongo();

const email = "admin@jadehospitainment.com";
const password = process.argv[2] || process.env.SEED_USER_PASSWORD || "JadeHost2026!";
const uri = process.env.MONGODB_URI?.trim();

if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

console.log("URI host:", uri.replace(/\/\/([^:]+):[^@]+@/, "//$1:***@"));

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: String,
  status: String,
  isDeleted: Boolean,
});

await mongoose.connect(uri);
const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const user = await User.findOne({ email, isDeleted: false }).lean();
if (!user) {
  console.error("FAIL: No user found for", email);
  process.exit(1);
}

console.log("User found:", user.email, "role:", user.role, "status:", user.status ?? "(unset)");
const valid = await bcrypt.compare(password, user.passwordHash);
console.log(`bcrypt.compare("${password}"):`, valid ? "OK" : "FAIL");

if (!valid) {
  console.log("\nTry: npm run db:seed:users  (resets password to JadeHost2026!)");
}

await mongoose.disconnect();
process.exit(valid ? 0 : 1);
