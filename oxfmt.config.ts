import { defineConfig } from 'oxfmt';

const sorting = {
  sortTailwindcss: {
    config: './tailwind.config.cjs',
    attributes: ['className', 'contentContainerClassName'],
    functions: ['cn', 'cva'],
  },
  sortPackageJson: true,
  sortImports: {
    customGroups: [
      { groupName: 'react', elementNamePattern: ['react', 'react-native'] },
      {
        groupName: 'expo',
        elementNamePattern: ['expo', 'expo-*', '@expo/**', '@expo-google-fonts/**'],
      },
    ],
    groups: [
      'side_effect_style',
      'react',
      { newlinesBetween: false },
      'expo',
      { newlinesBetween: false },
      ['builtin', 'external'],
      'internal',
      ['parent', 'sibling', 'index'],
      'unknown',
    ],
  },
};

export default defineConfig({
  singleQuote: true,
  printWidth: 100,
  ignorePatterns: [
    'pnpm-lock.yaml',
    '.expo/**',
    'android/**',
    'ios/**',
    'dist/**',
    'src/shared/database.types.ts',
  ],

  ...sorting,
});
