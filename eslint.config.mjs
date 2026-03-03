/**
 * ESLint Configuration (Flat Config Format)
 * 
 * Configures ESLint for code quality and consistency in the Aragorn AI project.
 * Uses the new flat config format (eslint.config.mjs) introduced in ESLint 9.
 * 
 * Configuration:
 * - Extends Next.js recommended ESLint rules
 * - Extends TypeScript ESLint rules
 * - Ignores build output (.next/) and generated files (next-env.d.ts)
 * 
 * Rules Included:
 * - next/core-web-vitals: Performance and accessibility rules
 * - next/typescript: TypeScript-specific Next.js rules
 * 
 * Usage:
 * - Run `npm run lint` to check for issues
 * - ESLint runs automatically during build (can be disabled in next.config.ts)
 * - Integrates with VS Code ESLint extension
 * 
 * Note: Uses FlatCompat for backward compatibility with legacy config format
 * 
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @see https://nextjs.org/docs/app/building-your-application/configuring/eslint
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Get current file directory (needed for ESM modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create compatibility layer for legacy ESLint configs
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLint configuration array
const eslintConfig = [
  {
    // Ignore build output and generated files
    ignores: [".next/", "next-env.d.ts"],
  },
  // Extend Next.js recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
