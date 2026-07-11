# data/repository

Interface `DealsRepository` e implementações (`MockDealsRepository` agora,
`PrismaDealsRepository` na fase final). A UI **só** acessa dados por aqui —
nunca importando `src/mocks/` direto. Seletor por `DATA_SOURCE` (`mock` | `prisma`).
