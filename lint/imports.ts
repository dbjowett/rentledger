import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['import'],
  rules: {
    'import/exports-last': 'error',
    'import/group-exports': 'error',
  },
});
