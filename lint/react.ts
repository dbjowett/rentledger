import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['react'],
  rules: {
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',

    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/no-children-prop': 'error',
  },
});
