/**
 * MongoDB migration: Atlas JadeDB → self-hosted jadeapp
 *
 * Usage:
 *   node scripts/migrate-mongo.mjs dump     # source → tmp/mongo-migration/
 *   node scripts/migrate-mongo.mjs restore  # tmp/mongo-migration/ → MONGODB_URI_TARGET
 *   node scripts/migrate-mongo.mjs migrate  # MONGODB_URI → MONGODB_URI_TARGET (direct copy)
 *   node scripts/migrate-mongo.mjs verify   # compare collection counts source vs target
 *
 * Env (from .env.local unless overridden):
 *   MONGODB_URI         — source (Atlas JadeDB)
 *   MONGODB_URI_TARGET  — destination (local/VPS jadeapp)
 *   MONGODB_SOURCE_DB   — default JadeDB
 *   MONGODB_TARGET_DB   — default jadeapp
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import { loadEnvLocal } from "./loadEnvLocal.mjs";
import { usePublicDnsForMongo } from "./mongoDnsFix.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const DUMP_DIR = path.join(root, "tmp", "mongo-migration");

loadEnvLocal();
usePublicDnsForMongo();

const SOURCE_URI = process.env.MONGODB_URI?.trim();
const TARGET_URI =
  process.env.MONGODB_URI_TARGET?.trim() ||
  process.env.MONGODB_URI_VPS?.trim();
const SOURCE_DB = process.env.MONGODB_SOURCE_DB?.trim() || "JadeDB";
const TARGET_DB = process.env.MONGODB_TARGET_DB?.trim() || "jadeapp";
const BATCH_SIZE = 500;

const mode = process.argv[2] ?? "help";

function requireUri(uri, label) {
  if (!uri) {
    console.error(`${label} is not set. Add to .env.local or pass as env var.`);
    process.exit(1);
  }
  return uri;
}

function redactUri(uri) {
  return uri.replace(/:([^:@/]+)@/, ":***@");
}

async function connect(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 20_000,
    connectTimeoutMS: 20_000,
  });
  await client.connect();
  return client;
}

async function listCollections(db) {
  const cols = await db.listCollections().toArray();
  return cols
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."))
    .sort();
}

function isGridFsCollection(name) {
  return name.endsWith(".files") || name.endsWith(".chunks");
}

function gridFsBucketNames(collections) {
  const buckets = new Set();
  for (const name of collections) {
    if (name.endsWith(".files")) buckets.add(name.slice(0, -".files".length));
    if (name.endsWith(".chunks")) buckets.add(name.slice(0, -".chunks".length));
  }
  return [...buckets].sort();
}

async function countDocs(db, collections) {
  const counts = {};
  for (const name of collections) {
    counts[name] = await db.collection(name).countDocuments();
  }
  return counts;
}

function printCounts(label, counts) {
  const entries = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  let total = 0;
  console.log(`\n${label}:`);
  for (const [name, n] of entries) {
    console.log(`  ${name}: ${n}`);
    total += n;
  }
  console.log(`  ── total documents: ${total}`);
  const buckets = gridFsBucketNames(Object.keys(counts));
  if (buckets.length) {
    console.log(`  GridFS buckets: ${buckets.join(", ")}`);
  }
}

async function copyCollection(sourceDb, targetDb, name, { drop = true } = {}) {
  const source = sourceDb.collection(name);
  const target = targetDb.collection(name);
  const total = await source.countDocuments();

  if (drop) {
    try {
      await target.drop();
    } catch {
      /* collection may not exist */
    }
  }

  if (total === 0) {
    return { name, copied: 0 };
  }

  const cursor = source.find({}).batchSize(BATCH_SIZE);
  let copied = 0;
  let batch = [];

  for await (const doc of cursor) {
    batch.push(doc);
    if (batch.length >= BATCH_SIZE) {
      await target.insertMany(batch, { ordered: false });
      copied += batch.length;
      batch = [];
      if (copied % 2000 === 0) {
        process.stdout.write(`  ${name}: ${copied}/${total}\r`);
      }
    }
  }
  if (batch.length) {
    await target.insertMany(batch, { ordered: false });
    copied += batch.length;
  }

  // Copy indexes (skip default _id)
  const indexes = await source.indexes();
  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    const { key, name: idxName, ...opts } = idx;
    delete opts.v;
    delete opts.ns;
    try {
      await target.createIndex(key, { ...opts, name: idxName });
    } catch (e) {
      console.warn(`  index ${name}.${idxName}: ${e.message}`);
    }
  }

  return { name, copied };
}

async function cmdDump() {
  requireUri(SOURCE_URI, "MONGODB_URI");
  fs.mkdirSync(DUMP_DIR, { recursive: true });

  const client = await connect(SOURCE_URI);
  const db = client.db(SOURCE_DB);
  const collections = await listCollections(db);
  const meta = {
    sourceDb: SOURCE_DB,
    targetDb: TARGET_DB,
    dumpedAt: new Date().toISOString(),
    collections: [],
  };

  console.log(`Dumping ${SOURCE_DB} from ${redactUri(SOURCE_URI)}`);
  console.log(`Output: ${DUMP_DIR}`);

  for (const name of collections) {
    const outPath = path.join(DUMP_DIR, `${name}.json`);
    const docs = await db.collection(name).find({}).toArray();
    fs.writeFileSync(outPath, JSON.stringify(docs));
    meta.collections.push({ name, count: docs.length });
    console.log(`  ${name}: ${docs.length}`);
  }

  const indexes = {};
  for (const name of collections) {
    indexes[name] = await db.collection(name).indexes();
  }

  fs.writeFileSync(path.join(DUMP_DIR, "_meta.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(DUMP_DIR, "_indexes.json"), JSON.stringify(indexes, null, 2));

  printCounts("Source counts", Object.fromEntries(meta.collections.map((c) => [c.name, c.count])));
  await client.close();
  console.log("\nDump complete.");
}

async function cmdRestore() {
  if (!TARGET_URI) {
    console.error(
      "MONGODB_URI_TARGET or MONGODB_URI_VPS is not set. Add VPS public URI to run restore.",
    );
    process.exit(1);
  }
  const metaPath = path.join(DUMP_DIR, "_meta.json");
  if (!fs.existsSync(metaPath)) {
    console.error(`No dump found at ${DUMP_DIR}. Run: node scripts/migrate-mongo.mjs dump`);
    process.exit(1);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const indexes = JSON.parse(fs.readFileSync(path.join(DUMP_DIR, "_indexes.json"), "utf8"));

  const client = await connect(TARGET_URI);
  const db = client.db(TARGET_DB);

  console.log(`Restoring into ${TARGET_DB} at ${redactUri(TARGET_URI)}`);

  for (const { name, count } of meta.collections) {
    const filePath = path.join(DUMP_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  skip ${name} — file missing`);
      continue;
    }
    try {
      await db.collection(name).drop();
    } catch {
      /* ok */
    }
    if (count === 0) {
      console.log(`  ${name}: 0 (empty)`);
      continue;
    }
    const docs = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (docs.length) {
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        await db.collection(name).insertMany(docs.slice(i, i + BATCH_SIZE), { ordered: false });
      }
    }
    for (const idx of indexes[name] ?? []) {
      if (idx.name === "_id_") continue;
      const { key, name: idxName, ...opts } = idx;
      delete opts.v;
      delete opts.ns;
      try {
        await db.collection(name).createIndex(key, { ...opts, name: idxName });
      } catch (e) {
        console.warn(`  index ${name}.${idxName}: ${e.message}`);
      }
    }
    console.log(`  ${name}: ${docs.length}`);
  }

  const collections = await listCollections(db);
  const counts = await countDocs(db, collections);
  printCounts("Target counts after restore", counts);
  await client.close();
  console.log("\nRestore complete.");
}

async function cmdMigrate() {
  requireUri(SOURCE_URI, "MONGODB_URI");
  requireUri(TARGET_URI, "MONGODB_URI_TARGET");

  const sourceClient = await connect(SOURCE_URI);
  const targetClient = await connect(TARGET_URI);
  const sourceDb = sourceClient.db(SOURCE_DB);
  const targetDb = targetClient.db(TARGET_DB);

  const collections = await listCollections(sourceDb);
  console.log(
    `Migrating ${SOURCE_DB} → ${TARGET_DB}\n  from: ${redactUri(SOURCE_URI)}\n  to:   ${redactUri(TARGET_URI)}`,
  );

  const sourceCounts = await countDocs(sourceDb, collections);
  printCounts("Source", sourceCounts);

  for (const name of collections) {
    const result = await copyCollection(sourceDb, targetDb, name, { drop: true });
    console.log(`  ${result.name}: ${result.copied}`);
  }

  const targetCollections = await listCollections(targetDb);
  const targetCounts = await countDocs(targetDb, targetCollections);
  printCounts("Target after migrate", targetCounts);

  await sourceClient.close();
  await targetClient.close();
  console.log("\nMigrate complete.");
}

async function cmdVerify() {
  requireUri(SOURCE_URI, "MONGODB_URI");
  requireUri(TARGET_URI, "MONGODB_URI_TARGET");

  const sourceClient = await connect(SOURCE_URI);
  const targetClient = await connect(TARGET_URI);
  const sourceDb = sourceClient.db(SOURCE_DB);
  const targetDb = targetClient.db(TARGET_DB);

  const sourceCols = await listCollections(sourceDb);
  const targetCols = await listCollections(targetDb);
  const sourceCounts = await countDocs(sourceDb, sourceCols);
  const targetCounts = await countDocs(targetDb, targetCols);

  printCounts(`Source (${SOURCE_DB})`, sourceCounts);
  printCounts(`Target (${TARGET_DB})`, targetCounts);

  let ok = true;
  for (const name of sourceCols) {
    const s = sourceCounts[name] ?? 0;
    const t = targetCounts[name] ?? 0;
    if (s !== t) {
      console.error(`MISMATCH ${name}: source=${s} target=${t}`);
      ok = false;
    }
  }

  await sourceClient.close();
  await targetClient.close();

  if (!ok) {
    console.error("\nVerification FAILED — counts differ.");
    process.exit(1);
  }
  console.log("\nVerification OK — all collection counts match.");
}

function cmdHelp() {
  console.log(`
MongoDB migration helper

  node scripts/migrate-mongo.mjs dump     Atlas → tmp/mongo-migration/
  node scripts/migrate-mongo.mjs restore  tmp/mongo-migration/ → MONGODB_URI_TARGET
  node scripts/migrate-mongo.mjs migrate  direct copy MONGODB_URI → MONGODB_URI_TARGET
  node scripts/migrate-mongo.mjs verify   compare document counts

Env:
  MONGODB_URI         source (${SOURCE_DB ? SOURCE_DB : "JadeDB"})
  MONGODB_URI_TARGET  destination (${TARGET_DB})
`);
}

try {
  switch (mode) {
    case "dump":
      await cmdDump();
      break;
    case "restore":
      await cmdRestore();
      break;
    case "migrate":
      await cmdMigrate();
      break;
    case "verify":
      await cmdVerify();
      break;
    default:
      cmdHelp();
  }
} catch (e) {
  console.error("Migration error:", e.message);
  process.exit(1);
}
