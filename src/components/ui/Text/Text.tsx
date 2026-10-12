import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

export const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      md: 'text-md',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    // Android ignores fontWeight on custom fonts, so each weight is its own family.
    weight: {
      regular: 'font-sans',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    tone: {
      ink: 'text-ink',
      grey: 'text-grey',
      muted: 'text-muted',
      accent: 'text-accent',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      white: 'text-white',
    },
  },
  defaultVariants: { size: 'md', weight: 'regular', tone: 'ink' },
});

export type TextSize = NonNullable<VariantProps<typeof textVariants>['size']>;
export type TextWeight = NonNullable<VariantProps<typeof textVariants>['weight']>;
export type TextTone = NonNullable<VariantProps<typeof textVariants>['tone']>;

export type TextProps = RNTextProps & VariantProps<typeof textVariants>;

export function Text({ size, weight, tone, className, ...rest }: TextProps) {
  return <RNText className={cn(textVariants({ size, weight, tone }), className)} {...rest} />;
}
