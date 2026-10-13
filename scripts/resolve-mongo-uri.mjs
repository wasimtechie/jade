import dns from "node:dns/promises";
import { loadEnvLocal } from "./loadEnvLocal.mjs";

loadEnvLocal();
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const uri = process.env.MONGODB_URI?.trim();
if (!uri?.startsWith("mongodb+srv://")) {
  console.log("Not an SRV URI — no conversion needed");
  process.exit(0);
}

const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
if (!match) {
  console.error("Could not parse MONGODB_URI");
  process.exit(1);
}

const [, user, pass, host, dbPath = "", query = ""] = match;
const srvHost = `_mongodb._tcp.${host}`;
const records = await dns.resolveSrv(srvHost);
const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");
const db = dbPath || "/JadeDB";
const qs = query ? query.replace(/^\?/, "") : "retryWrites=true&w=majority";
const standard = `mongodb://${user}:${pass}@${hosts}${db}?${qs}&authSource=admin`;

console.log("\nStandard URI (no SRV — use if Next.js login fails):\n");
console.log(`MONGODB_URI=${standard}\n`);
