import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { fontSize } from '../theme/tokens';

// Weights are font families (Android ignores fontWeight on custom fonts), so they must
// conflict with font-sans/font-mono, and the type scale uses custom size keys.
const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-weight': [],
      'font-family': [{ font: ['sans', 'medium', 'semibold', 'bold', 'mono'] }],
    },
  },
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(fontSize) }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
