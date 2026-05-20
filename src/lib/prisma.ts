import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

let connectionString: string;

if (process.env.NODE_ENV === "production") {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required in production.");
  }
  connectionString = process.env.DATABASE_URL;
} else {
  // In non-production environments (development and testing), allow falling back to DIRECT_URL if DATABASE_URL is missing.
  connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  if (!connectionString) {
    console.warn("⚠️ Warning: Neither DATABASE_URL nor DIRECT_URL environment variables are defined.");
  }
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
    });
  }
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(globalForPrisma.pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
