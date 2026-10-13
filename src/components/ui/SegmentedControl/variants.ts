import { cva } from 'class-variance-authority';

const segmentedControlVariants = cva('flex-row rounded-xl bg-surface p-0.5', {
  variants: {
    size: {
      sm: 'h-9',
      md: 'h-11',
    },
    rounded: {
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: { size: 'md', rounded: 'xl' },
});
const segmentIndicatorVariants = cva('flex-1 rounded-xl border border-line bg-card');

const segmentVariants = cva('flex-1 items-center justify-center rounded-xl px-3 active:opacity-80');

const segmentTextVariants = cva('font-semibold', {
  variants: {
    size: { sm: 'text-base', md: 'text-md' },
    selected: { true: 'text-ink', false: 'text-grey' },
  },
  defaultVariants: { size: 'md', selected: false },
});

export { segmentedControlVariants, segmentIndicatorVariants, segmentVariants, segmentTextVariants };
