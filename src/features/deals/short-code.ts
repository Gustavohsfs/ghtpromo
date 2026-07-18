import { customAlphabet } from "nanoid";

/** Alfabeto URL-safe sem hífen/underscore — código legível em qualquer chat. */
export const SHORT_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const SHORT_CODE_LENGTH = 7;

/**
 * Código aleatório do link curto /p/{code}. 62^7 ≈ 3,5 tri de combinações —
 * colisão desprezível; o índice único no banco é a última linha de defesa.
 */
export const generateShortCode = customAlphabet(SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH);

/**
 * Código estável derivado de uma seed (hash FNV-1a) — dados mock/demo
 * precisam do mesmo código em todo processo para o seed ser idempotente.
 */
export function deriveShortCode(seed: string): string {
  let hash = 0x811c9dc5;
  const mix = (value: number) => {
    hash ^= value;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  };
  for (let index = 0; index < seed.length; index++) mix(seed.charCodeAt(index));

  let code = "";
  for (let index = 0; index < SHORT_CODE_LENGTH; index++) {
    mix(index);
    code += SHORT_CODE_ALPHABET[hash % SHORT_CODE_ALPHABET.length];
  }
  return code;
}
