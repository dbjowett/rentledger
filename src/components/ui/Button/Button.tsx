import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor, type Neutral, type Tone } from '@/theme/tokens';

import { Text } from '../Text/Text';

export const buttonVariants = cva('flex-row items-center justify-center active:opacity-80', {
  variants: {
    variant: {
      primary: 'bg-accent',
      secondary: 'border border-outline bg-card',
      ghost: 'bg-transparent',
      danger: 'bg-danger',
      link: 'bg-transparent',
    },
    size: {
      sm: 'h-9 px-4',
      md: 'h-11 px-5',
      lg: 'h-[54px] px-6',
    },
    shape: {
      pill: 'rounded-full',
      rounded: '',
    },
    fullWidth: { true: 'self-stretch', false: 'self-start' },
    disabled: { true: 'opacity-50', false: '' },
  },
  compoundVariants: [
    { shape: 'rounded', size: 'sm', className: 'rounded-[10px]' },
    { shape: 'rounded', size: 'md', className: 'rounded-xl' },
    { shape: 'rounded', size: 'lg', className: 'rounded-2xl' },
    // Link is inline text: no box, just the label.
    { variant: 'link', className: 'h-auto rounded-none px-0' },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    shape: 'pill',
    fullWidth: false,
    disabled: false,
  },
});

export const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-ink',
      ghost: 'text-accent',
      danger: 'text-white',
      link: 'text-accent',
    },
    size: {
      sm: 'text-base',
      md: 'text-md',
      lg: 'text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

const contentColor: Record<ButtonVariant, Tone | Neutral> = {
  primary: 'white',
  secondary: 'ink',
  ghost: 'accent',
  danger: 'white',
  link: 'accent',
};

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

// Pads small visuals out to a 44×44 touch target.
const hitSlop: Record<ButtonSize, number> = { sm: 4, md: 0, lg: 0 };

export type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> &
  Omit<VariantProps<typeof buttonVariants>, 'variant' | 'size' | 'disabled'> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    label: string;
    leftIcon?: LucideIcon;
    loading?: boolean;
    disabled?: boolean;
  };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  shape,
  fullWidth,
  leftIcon: LeftIcon,
  loading = false,
  disabled = false,
  className,
  ...rest
}: ButtonProps) {
  const color = toneColor(contentColor[variant]);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole={variant === 'link' ? 'link' : 'button'}
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={variant === 'link' ? 12 : hitSlop[size]}
      className={cn(buttonVariants({ variant, size, shape, fullWidth, disabled }), className)}
      {...rest}
    >
      {/* Content stays laid out while loading so the button keeps its width. */}
      <View
        className={cn(
          'flex-row items-center',
          size === 'sm' ? 'gap-1.5' : 'gap-2',
          loading && 'opacity-0',
        )}
      >
        {LeftIcon && <LeftIcon size={iconSize[size]} color={color} strokeWidth={2} />}
        <Text className={buttonTextVariants({ variant, size })}>{label}</Text>
      </View>
      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color={color} />
        </View>
      )}
    </Pressable>
  );
}
