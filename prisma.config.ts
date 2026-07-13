import { defineConfig } from "prisma/config";

/**
 * Config do Prisma CLI (v7). A conexão fica FORA do schema: o CLI
 * (migrate/db push/studio) lê daqui; o runtime usa driver adapter no
 * PrismaClient (src/server/prisma.ts). Sem banco por enquanto — generate e
 * validate funcionam sem DATABASE_URL; comandos de migração exigirão a env.
 * Ver docs/ARCHITECTURE.md, "Como plugar o banco".
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Intencionalmente opcional: só comandos que tocam o banco precisam dela.
    url: process.env.DATABASE_URL,
  },
});
