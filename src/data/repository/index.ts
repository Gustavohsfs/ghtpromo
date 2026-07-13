import type { DealsRepository } from "./deals.repository";
import { MockDealsRepository } from "./mock-deals.repository";
import { PrismaDealsRepository } from "./prisma-deals.repository";

export type { DealsRepository } from "./deals.repository";

const VALID_SOURCES = ["mock", "prisma"] as const;
type DataSource = (typeof VALID_SOURCES)[number];

/** Fonte de dados ativa (env DATA_SOURCE), com default seguro para mock. */
export function getDataSource(): DataSource {
  const source = process.env.DATA_SOURCE;
  return VALID_SOURCES.includes(source as DataSource) ? (source as DataSource) : "mock";
}

/** true quando a vitrine está rodando sobre dados fictícios. */
export function isMockDataSource(): boolean {
  return getDataSource() === "mock";
}

const mockRepository = new MockDealsRepository();
const prismaRepository = new PrismaDealsRepository();

/**
 * Ponto único de obtenção do repositório. Trocar de fonte de dados é trocar
 * a env DATA_SOURCE — nenhum componente muda. O client Prisma só é
 * instanciado na primeira consulta (lazy), então o default mock funciona
 * sem banco nem DATABASE_URL.
 */
export function getDealsRepository(): DealsRepository {
  switch (getDataSource()) {
    case "prisma":
      return prismaRepository;
    case "mock":
      return mockRepository;
  }
}
