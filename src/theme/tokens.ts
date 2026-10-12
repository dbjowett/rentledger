export const colors = {
  ink: '#0F0F12',
  grey: '#6B6B73',
  muted: '#A0A0A8',
  line: '#ECECEF',
  outline: '#D9D9DE', // secondary button / outline borders
  surface: '#F2F2F4',
  card: '#FFFFFF',
  accent: { DEFAULT: '#1414C8', tint: '#EBEBFD' },
  success: { DEFAULT: '#23804F', tint: '#E4F4EA' },
  warning: { DEFAULT: '#9A6200', tint: '#FFF2D9' },
  danger: { DEFAULT: '#C0332B', tint: '#FDE8E6' },
  slate: { DEFAULT: '#4A5568', tint: '#EEF0F4' },
  violet: { DEFAULT: '#5B3FD0', tint: '#EFEBFD' },
} as const;

export type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'slate' | 'violet';
export type Neutral = 'ink' | 'grey' | 'muted' | 'white';

/** Raw colour for props that can't take a class (icon `color`, spinners). */
export const toneColor = (t: Tone | Neutral): string => {
  if (t === 'white') return colors.card;
  if (t === 'ink' || t === 'grey' || t === 'muted') return colors[t];
  return colors[t].DEFAULT;
};

// Type scale: [fontSize, lineHeight] in px. Used as Tailwind `text-*` classes.
export const fontSize = {
  xs: ['12px', '16px'],
  sm: ['13px', '18px'],
  base: ['14px', '20px'],
  md: ['16px', '22px'],
  lg: ['17px', '22px'],
  xl: ['18px', '24px'],
  '2xl': ['22px', '28px'],
  '3xl': ['28px', '34px'],
  '4xl': ['34px', '40px'],
} as const;

export type FontSize = keyof typeof fontSize;

export const spacing = {
  screen: '20px', // screen side padding
} as const;
