import dns from "node:dns";

/** Some ISPs/corporate DNS fail MongoDB Atlas SRV lookups — use public resolvers. */
export function usePublicDnsForMongo() {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}
