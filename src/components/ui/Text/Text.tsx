import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const textVariants = cva('', {
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

type TextSize = NonNullable<VariantProps<typeof textVariants>['size']>;
type TextWeight = NonNullable<VariantProps<typeof textVariants>['weight']>;
type TextTone = NonNullable<VariantProps<typeof textVariants>['tone']>;

type TextProps = RNTextProps & VariantProps<typeof textVariants>;

function Text({ size, weight, tone, className, ...rest }: TextProps) {
  return <RNText className={cn(textVariants({ size, weight, tone }), className)} {...rest} />;
}

export { textVariants, type TextSize, type TextWeight, type TextTone, type TextProps, Text };
