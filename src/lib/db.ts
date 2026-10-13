import "@/lib/mongoDns";
import mongoose from "mongoose";
import dns from "node:dns";

declare global {
  // eslint-disable-next-line no-var
  var __jadeMongooseConn: Promise<typeof mongoose> | undefined;
  // eslint-disable-next-line no-var
  var __jadeMongooseConnUri: string | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI?.trim();

/** Atlas SRV fails on some local DNS — use public resolvers when connecting via mongodb+srv. */
function configureMongoDns(uri: string): void {
  if (uri.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
}

export function isMongoConfigured(): boolean {
  return Boolean(MONGODB_URI);
}

function isConnectionLive(): boolean {
  return mongoose.connection.readyState === 1;
}

async function openConnection(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Set it in .env.local (see .env.example).",
    );
  }

  mongoose.set("strictQuery", true);
  configureMongoDns(MONGODB_URI);

  const conn = await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15_000,
    socketTimeoutMS: 45_000,
    /** Serverless: fail fast instead of buffering commands while disconnected. */
    bufferCommands: false,
  });

  return conn;
}

/**
 * MongoDB connection — sole DB entry point (Mongo-only PMS).
 * BLOCKED: requires MONGODB_URI (Tier 1 test replica set or Tier 2 production).
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Set it in .env.local (see .env.example).",
    );
  }

  if (global.__jadeMongooseConnUri !== MONGODB_URI) {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch {
        /* ignore */
      }
    }
    global.__jadeMongooseConn = undefined;
    global.__jadeMongooseConnUri = MONGODB_URI;
  }

  if (global.__jadeMongooseConn) {
    try {
      const conn = await global.__jadeMongooseConn;
      if (isConnectionLive()) return conn;
      global.__jadeMongooseConn = undefined;
    } catch {
      global.__jadeMongooseConn = undefined;
    }
  }

  if (isConnectionLive()) {
    return mongoose;
  }

  global.__jadeMongooseConn = openConnection().catch((err) => {
    global.__jadeMongooseConn = undefined;
    throw err;
  });

  return global.__jadeMongooseConn;
}

export { mongoose };
