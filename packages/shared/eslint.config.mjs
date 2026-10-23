// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'eslint.config.mjs', 'vitest.config.ts'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
);
