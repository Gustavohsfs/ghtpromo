import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Hash de senha com scrypt do Node (sem dependência externa).
 * Formato persistido: `scrypt$<custo N>$<salt hex>$<hash hex>`.
 */

const SCRYPT_COST = 16384; // N (2^14) — padrão recomendado para logins interativos
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** promisify não enxerga a sobrecarga com opções — wrapper manual. */
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, { N: SCRYPT_COST });
  return `scrypt$${SCRYPT_COST}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** Comparação timing-safe; hash malformado retorna false (nunca lança). */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, cost, saltHex, hashHex] = storedHash.split("$");
  if (scheme !== "scrypt" || !cost || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: Number(cost),
    });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
