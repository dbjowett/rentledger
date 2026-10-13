import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

const iconButtonVariants = cva('items-center justify-center active:opacity-80', {
  variants: {
    variant: {
      plain: 'bg-transparent active:bg-surface',
      outline: 'border border-outline bg-card',
      filled: 'bg-accent',
    },
    size: {
      sm: 'h-9 w-9',
      md: 'h-11 w-11',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-tile',
    },
    disabled: { true: 'opacity-50', false: '' },
  },
  defaultVariants: { variant: 'plain', size: 'md', shape: 'circle', disabled: false },
});

const iconSize = { sm: 18, md: 20 } as const;

type IconButtonProps = Omit<PressableProps, 'children' | 'disabled'> &
  Omit<VariantProps<typeof iconButtonVariants>, 'size' | 'disabled'> & {
    size?: keyof typeof iconSize;
    icon: LucideIcon;
    /** Required: icon-only controls have no visible label. */
    accessibilityLabel: string;
    disabled?: boolean;
  };

function IconButton({
  icon: Icon,
  variant = 'plain',
  size = 'md',
  shape,
  disabled = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={size === 'sm' ? 4 : 0}
      className={cn(iconButtonVariants({ variant, size, shape, disabled }), className)}
      {...rest}
    >
      <Icon
        size={iconSize[size]}
        color={toneColor(variant === 'filled' ? 'white' : 'ink')}
        strokeWidth={2}
      />
    </Pressable>
  );
}

export { iconButtonVariants, type IconButtonProps, IconButton };
