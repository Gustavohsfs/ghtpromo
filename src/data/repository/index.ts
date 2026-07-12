import type { DealsRepository } from "./deals.repository";
import { MockDealsRepository } from "./mock-deals.repository";

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

/**
 * Ponto único de obtenção do repositório. Trocar de fonte de dados é trocar
 * a env DATA_SOURCE — nenhum componente muda.
 */
export function getDealsRepository(): DealsRepository {
  switch (getDataSource()) {
    case "prisma":
      // PrismaDealsRepository chega na fase final (docs/PLAN.md, Fase 8).
      throw new Error(
        "DATA_SOURCE=prisma ainda não está disponível: o PrismaDealsRepository é montado na Fase 8.",
      );
    case "mock":
      return mockRepository;
  }
}
