import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

loadEnvLocal();
usePublicDnsForMongo();

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error("MONGODB_URI missing — set it in .env.local");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log("MongoDB connected OK");
  await mongoose.disconnect();
} catch (e) {
  console.error("MongoDB connection failed:", e.message);
  if (e.message.includes("bad auth")) {
    console.error("\nFix: Atlas → Database Access → mohdsaad7661_db_user → Edit Password");
    console.error("Then update MONGODB_URI password in .env.local and retry.");
  }
  process.exit(1);
}
