import { env } from "~/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma";

const createPrismaClient = () =>
  // Prisma 7 uses a driver adapter for direct database connections.
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: env.DATABASE_URL,
      }),
    ),
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
