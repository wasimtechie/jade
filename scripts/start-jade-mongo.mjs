/**
 * Start local MongoDB for jadeapp (persisted under tmp/mongo-data).
 * Creates jadeapp_user if missing. Keeps running until Ctrl+C.
 *
 *   node scripts/start-jade-mongo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dbPath = path.join(root, "tmp", "mongo-data");
const uriFile = path.join(dbPath, "connection.uri");

const JADEAPP_USER = "jadeapp_user";
const JADEAPP_PASS = "Stack@2026";
const JADEAPP_DB = "jadeapp";

fs.mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: {
    dbPath,
    port: 27017,
    ip: "127.0.0.1",
    storageEngine: "wiredTiger",
    launchTimeout: 60_000,
  },
});

const uri = mongod.getUri();
const noAuthUri = `${uri}${JADEAPP_DB}`;

// Bootstrap user (no auth on fresh memory-server instance)
const admin = new MongoClient(uri);
await admin.connect();
const db = admin.db(JADEAPP_DB);

const users = await db.command({ usersInfo: JADEAPP_USER });
if (!users.users?.length) {
  await db.command({
    createUser: JADEAPP_USER,
    pwd: JADEAPP_PASS,
    roles: [{ role: "readWrite", db: JADEAPP_DB }],
  });
  console.log(`Created user ${JADEAPP_USER} on ${JADEAPP_DB}`);
} else {
  console.log(`User ${JADEAPP_USER} already exists`);
}
await admin.close();

const authUri = `mongodb://${JADEAPP_USER}:${encodeURIComponent(JADEAPP_PASS)}@127.0.0.1:27017/${JADEAPP_DB}?authSource=${JADEAPP_DB}`;
fs.writeFileSync(uriFile, authUri);

console.log("\nLocal MongoDB running:");
console.log(`  ${authUri}`);
console.log(`\nSaved to ${uriFile}`);
console.log("Press Ctrl+C to stop.\n");

process.on("SIGINT", async () => {
  await mongod.stop();
  process.exit(0);
});

await new Promise(() => {});
