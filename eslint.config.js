import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'dist/',
    '.astro/',
    'node_modules/',
    'coverage/',
    'playwright-report/',
    '.lighthouseci/',
  ]),
  js.configs.recommended,
  tseslint.configs.strict,
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs['jsx-a11y-strict'],
  {
    // Scrollable table wrapper must be keyboard-focusable (axe: scrollable-region-focusable).
    files: ['src/components/legal/CookieTable.astro'],
    rules: { 'astro/jsx-a11y/no-noninteractive-tabindex': 'off' },
  },
  eslintConfigPrettier,
);
