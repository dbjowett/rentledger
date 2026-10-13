import { defineConfig, type OxlintOverride } from 'oxlint';

import eslint from './lint/eslint.ts';
import imports from './lint/imports.ts';
import oxc from './lint/oxc.ts';
import react from './lint/react.ts';
import typescript from './lint/typescript.ts';
import unicorn from './lint/unicorn.ts';

const overrides: OxlintOverride[] = [
  {
    files: ['*.cjs'],
    env: { node: true, commonjs: true },
    rules: {
      'typescript/no-require-imports': 'off',
      'typescript/no-var-requires': 'off',
      'unicorn/prefer-module': 'off',
      'typescript/no-unsafe-argument': 'off',
      'typescript/no-unsafe-assignment': 'off',
      'typescript/no-unsafe-call': 'off',
      'typescript/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['*.config.ts', 'lint/**/*.ts'],
    rules: { 'unicorn/no-anonymous-default-export': 'off' },
  },
  {
    files: ['src/components/ui/Text/Text.tsx', 'src/dev/gallery/FoundationsTab.tsx'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.d.ts'],
    rules: { 'typescript/consistent-type-definitions': 'off' },
  },
];

export default defineConfig({
  extends: [eslint, oxc, typescript, unicorn, react, imports],
  categories: {
    correctness: 'off',
    suspicious: 'off',
    pedantic: 'off',
    perf: 'off',
    style: 'off',
    restriction: 'off',
    nursery: 'off',
  },
  options: {
    typeAware: true,
    typeCheck: true,
    reportUnusedDisableDirectives: 'error',
  },
  env: { builtin: true, es2024: true },
  globals: { __DEV__: 'readonly' },
  ignorePatterns: [
    '.expo/**',
    'android/**',
    'ios/**',
    'dist/**',
    'expo-env.d.ts',
    'src/shared/database.types.ts',
  ],
  overrides,
});
