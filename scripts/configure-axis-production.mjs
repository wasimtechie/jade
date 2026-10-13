/** Update database mappings only; never sends requests to Axis Rooms. Dry run by default. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal();

async function main() {
  const apply = process.argv.includes("--apply");
  if (process.argv.slice(2).some(arg => arg !== "--apply")) throw new Error("Usage: npm run axis:configure:production -- [--apply]");
  if (!process.env.MONGODB_URI?.trim()) throw new Error("MONGODB_URI is required");
  const { properties } = JSON.parse(await fs.readFile(path.join(root, "src/data/axisrooms/production-mappings.json"), "utf8"));
  for (const field of ["hotelId", "roomId", "ratePlanId"]) {
    const ids = properties.map(p => p[field]);
    if (ids.some(id => !/^\d+$/.test(id)) || new Set(ids).size !== ids.length) throw new Error(`Invalid or duplicate ${field}`);
  }
  const mapped = properties.filter(p => p.slug);
  if (new Set(mapped.map(p => p.slug)).size !== mapped.length) throw new Error("Duplicate villa slug");
  usePublicDnsForMongo();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const collection = mongoose.connection.db.collection("villas");
  const villas = await collection.find({ isDeleted: { $ne: true } }).toArray();
  const plan = [];
  for (const property of mapped) {
    const matches = villas.filter(v => v.slug === property.slug);
    if (matches.length !== 1) throw new Error(`Expected one active villa for ${property.slug}, found ${matches.length}`);
    const villa = matches[0];
    if (villas.some(v => String(v._id) !== String(villa._id) && v.axisRooms?.propertyId === property.hotelId)) throw new Error(`Hotel ${property.hotelId} is already mapped to another villa`);
    const axisRooms = {
      ...villa.axisRooms, propertyId: property.hotelId, roomTypeId: property.roomId,
      ratePlanId: property.ratePlanId, inventoryUnits: 1,
    };
    const changed = villa.channelMode !== "channel_managed" || Object.entries(axisRooms).some(([k,v]) => villa.axisRooms?.[k] !== v);
    if (changed) plan.push({ villa, update: { $set: { axisRooms, channelMode: "channel_managed", updatedAt: new Date() } }, action: "production mapping" });
  }
  // Retire only the known synthetic UAT IDs. Properties with no supplied live ID
  // stay in their existing mode and appear as awaiting mapping when CM managed.
  for (const villa of villas) {
    if (mapped.some(p => p.slug === villa.slug)) continue;
    const axis = villa.axisRooms;
    const synthetic = axis && ((/^13(?:0[1-9]|1[0-6])$/.test(axis.propertyId) && axis.roomTypeId === "1" && axis.ratePlanId === "1") || (axis.propertyId === "1234" && ["1", "2"].includes(axis.roomTypeId) && ["1", "2"].includes(axis.ratePlanId)));
    if (synthetic) plan.push({ villa, update: { $unset: { axisRooms: "" }, $set: { updatedAt: new Date() } }, action: "retire sandbox mapping" });
  }
  console.table(plan.map(p => ({ slug: p.villa.slug, action: p.action, hotelId: p.update.$set?.axisRooms?.propertyId ?? "awaiting mapping" })));
  const pending = properties.filter(p => !p.slug).map(p => p.name);
  console.log(`Confirmed mappings: ${mapped.length}; skipped properties: ${pending.join(", ") || "none"}.`);
  if (!apply) { console.log("Dry run only. Use --apply to update the configured database; no Axis API calls are made."); return; }
  if (!plan.length) { console.log("Already configured; no changes required."); return; }
  const backupDir = path.join(root, "tmp/axisrooms-production");
  await fs.mkdir(backupDir, { recursive: true });
  const backup = path.join(backupDir, `mapping-backup-${Date.now()}.json`);
  await fs.writeFile(backup, JSON.stringify(plan.map(({ villa }) => ({ _id: villa._id, slug: villa.slug, axisRooms: villa.axisRooms, channelMode: villa.channelMode, updatedAt: villa.updatedAt })), null, 2) + "\n", { mode: 0o600 });
  const result = await collection.bulkWrite(plan.map(({ villa, update }) => ({ updateOne: { filter: { _id: villa._id, updatedAt: villa.updatedAt ?? { $exists: false } }, update } })), { ordered: true });
  if (result.matchedCount !== plan.length) throw new Error(`Some villas changed during configuration; review backup ${backup} before retrying.`);
  console.log(`Updated ${result.modifiedCount} villas; backup: ${backup}. No Axis API requests sent.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
