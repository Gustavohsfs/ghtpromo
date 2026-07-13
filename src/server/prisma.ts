import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Singleton LAZY do Prisma Client (só instancia quando alguém consulta, ou
 * seja, quando DATA_SOURCE=prisma). Cache em globalThis evita esgotar o pool
 * de conexões com o hot reload do dev server.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Com DATA_SOURCE=prisma o banco é obrigatório — ver .env.example e docs/ARCHITECTURE.md.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export function getPrismaClient(): PrismaClient {
  return (globalForPrisma.prisma ??= createPrismaClient());
}
