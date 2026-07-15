import "dotenv/config";

import { readFileSync } from "node:fs";

import { importAwinFeed } from "../src/server/awin-import";

/**
 * Importação MANUAL do datafeed Awin a partir de CSV local (gitignorado em
 * data/private/). A importação automática diária roda via Vercel Cron na
 * rota /api/cron/import-awin — este script fica como fallback/ferramenta dev.
 *
 * Uso:
 *   npm run db:import-awin                     # importa data/private/awin-kabum.csv
 *   npm run db:import-awin -- --clean-demo     # também remove ofertas demo
 *                                              # (links exemplo.ghtpromo.dev);
 *                                              # `npm run db:seed` restaura
 */

const FEED_PATH = "data/private/awin-kabum.csv";

async function main() {
  const stats = await importAwinFeed(readFileSync(FEED_PATH), {
    cleanDemo: process.argv.includes("--clean-demo"),
  });
  console.log("Importação Awin concluída:", stats);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
