import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { formatCents } from '@/shared/money';

import { Text, type TextProps } from '../Text/Text';

const amountTextVariants = cva('font-mono', {
  variants: {
    kind: {
      income: 'text-success',
      expense: 'text-danger',
      neutral: 'text-ink',
    },
  },
  defaultVariants: { kind: 'neutral' },
});

type AmountKind = NonNullable<VariantProps<typeof amountTextVariants>['kind']>;

const MINUS = '−';

/**
 * Sign rules: income is "+" and expense is "−" (only when `showSign`), regardless of the sign
 * of `cents`. Neutral amounts take their sign from `cents`; a negative neutral amount always
 * shows "−", and a positive one shows "+" only when `showSign`.
 */
const spokenSigns: Record<string, string> = { [MINUS]: 'minus ', '+': 'plus ', '': '' };

function signFor(cents: number, kind: AmountKind, showSign: boolean) {
  if (kind === 'income') return showSign ? '+' : '';
  if (kind === 'expense') return showSign ? MINUS : '';
  if (cents < 0) return MINUS;
  return showSign && cents > 0 ? '+' : '';
}

type AmountProps = Omit<TextProps, 'children' | 'weight' | 'tone'> & {
  cents: number;
  kind?: AmountKind;
  showSign?: boolean;
  hideCents?: boolean;
};

function Amount({
  cents,
  kind = 'neutral',
  showSign = false,
  hideCents = false,
  size,
  className,
  ...rest
}: AmountProps) {
  const sign = signFor(cents, kind, showSign);
  const value = formatCents(cents, hideCents);
  const spokenSign = spokenSigns[sign];

  return (
    <Text
      size={size}
      accessibilityLabel={`${spokenSign}${value}`}
      className={cn(amountTextVariants({ kind }), className)}
      {...rest}
    >
      {sign}
      {value}
    </Text>
  );
}

export { amountTextVariants, type AmountKind, type AmountProps, Amount };
