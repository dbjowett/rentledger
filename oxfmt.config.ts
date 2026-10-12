import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  printWidth: 100,
  sortTailwindcss: {
    config: './tailwind.config.cjs',
    attributes: ['className', 'contentContainerClassName'],
    functions: ['cn', 'cva'],
  },
  ignorePatterns: ['pnpm-lock.yaml', '.expo/**', 'android/**', 'ios/**', 'dist/**'],
});
