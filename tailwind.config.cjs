const { colors, fontSize, spacing } = require('./src/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  corePlugins: { fontWeight: false },
  theme: {
    fontSize,
    extend: {
      colors,
      spacing,
      borderRadius: { tile: '14px', card: '22px', sheet: '24px' },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        mono: ['IBMPlexMono_600SemiBold'],
      },
    },
  },
  plugins: [],
};
