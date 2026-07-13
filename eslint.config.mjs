import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Desativa regras de estilo que conflitam com o Prettier (sempre por último).
  prettier,
  {
    rules: {
      // TS strict: proíbe `any` explícito em todo o projeto (SPEC §3.2).
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    // Client Prisma gerado (prisma generate)
    "src/generated/**",
  ]),
]);

export default eslintConfig;
