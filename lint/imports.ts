import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['import'],
  rules: {
    'import/exports-last': 'error',
    'import/first': 'error',
    'import/group-exports': 'error',
  },
});
