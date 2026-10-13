/**
 * Apply public DNS resolvers before any MongoDB SRV lookup.
 * Import this module early (instrumentation, db) on Windows/ISP DNS that block SRV.
 */
import dns from "node:dns";

const uri = process.env.MONGODB_URI?.trim();
if (uri?.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}
