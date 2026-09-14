import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
export default defineConfig([
  ...nextVitals,
  // The existing GSAP/R3F imperative animation adapters use mutable refs.
  // Compiler-only purity rules do not apply; retain hooks ordering/dependency checks.
  { rules: { "react-hooks/refs": "off", "react-hooks/immutability": "off", "react-hooks/set-state-in-effect": "off", "@next/next/no-img-element": "off" } },
  globalIgnores([".next/**", "test-results/**", "playwright-report/**"]),
]);
