import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy frontend is a separate application and is not part of this Next.js build.
    "frontend/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // These rules are enabled by newer React/Next lint presets but conflict with
      // existing client-side flows that are already type-checked and production-built.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
