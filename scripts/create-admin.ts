import "dotenv/config";

import { hashPassword } from "../src/server/password";
import { getPrismaClient } from "../src/server/prisma";

/**
 * Cria (ou atualiza a senha de) um admin do painel /admin.
 *
 * Uso: npx tsx scripts/create-admin.ts <email> <senha>
 */
async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Uso: npx tsx scripts/create-admin.ts <email> <senha>");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const admin = await getPrismaClient().admin.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), passwordHash },
    update: { passwordHash },
  });
  console.log(`Admin pronto: ${admin.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
