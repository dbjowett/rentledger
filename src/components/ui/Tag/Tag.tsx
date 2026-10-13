import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor, type Neutral, type Tone } from '@/theme/tokens';

import { Text } from '../Text/Text';

const tagVariants = cva('flex-row items-center self-start rounded-full', {
  variants: {
    tone: { neutral: '', success: '', warning: '', danger: '', accent: '', violet: '' },
    variant: { soft: '', solid: '', outline: 'border' },
    size: {
      sm: 'h-[22px] gap-1 px-2',
      md: 'h-[26px] gap-1 px-2.5',
    },
  },
  compoundVariants: [
    { variant: 'soft', tone: 'neutral', className: 'bg-line' },
    { variant: 'soft', tone: 'success', className: 'bg-success-tint' },
    { variant: 'soft', tone: 'warning', className: 'bg-warning-tint' },
    { variant: 'soft', tone: 'danger', className: 'bg-danger-tint' },
    { variant: 'soft', tone: 'accent', className: 'bg-accent-tint' },
    { variant: 'soft', tone: 'violet', className: 'bg-violet-tint' },
    { variant: 'solid', tone: 'neutral', className: 'bg-grey' },
    { variant: 'solid', tone: 'success', className: 'bg-success' },
    { variant: 'solid', tone: 'warning', className: 'bg-warning' },
    { variant: 'solid', tone: 'danger', className: 'bg-danger' },
    { variant: 'solid', tone: 'accent', className: 'bg-accent' },
    { variant: 'solid', tone: 'violet', className: 'bg-violet' },
    { variant: 'outline', tone: 'neutral', className: 'border-outline' },
    { variant: 'outline', tone: 'success', className: 'border-success' },
    { variant: 'outline', tone: 'warning', className: 'border-warning' },
    { variant: 'outline', tone: 'danger', className: 'border-danger' },
    { variant: 'outline', tone: 'accent', className: 'border-accent' },
    { variant: 'outline', tone: 'violet', className: 'border-violet' },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft', size: 'sm' },
});

const tagTextVariants = cva('font-semibold', {
  variants: {
    tone: {
      neutral: 'text-grey',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      accent: 'text-accent',
      violet: 'text-violet',
    },
    variant: { soft: '', solid: 'text-white', outline: '' },
    size: { sm: 'text-xs', md: 'text-sm' },
  },
  defaultVariants: { tone: 'neutral', variant: 'soft', size: 'sm' },
});

type TagTone = NonNullable<VariantProps<typeof tagVariants>['tone']>;
type TagVariant = NonNullable<VariantProps<typeof tagVariants>['variant']>;
type TagSize = NonNullable<VariantProps<typeof tagVariants>['size']>;

const iconTone: Record<TagTone, Tone | Neutral> = {
  neutral: 'grey',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  accent: 'accent',
  violet: 'violet',
};

const iconSize: Record<TagSize, number> = { sm: 12, md: 14 };

type TagProps = ViewProps & {
  label: string;
  tone?: TagTone;
  variant?: TagVariant;
  size?: TagSize;
  icon?: LucideIcon;
};

function Tag({
  label,
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  icon: Icon,
  className,
  ...rest
}: TagProps) {
  const color = toneColor(variant === 'solid' ? 'white' : iconTone[tone]);

  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(tagVariants({ tone, variant, size }), className)}
      {...rest}
    >
      {Icon && <Icon size={iconSize[size]} color={color} strokeWidth={2.25} />}
      <Text numberOfLines={1} className={tagTextVariants({ tone, variant, size })}>
        {label}
      </Text>
    </View>
  );
}

export {
  tagVariants,
  tagTextVariants,
  type TagTone,
  type TagVariant,
  type TagSize,
  type TagProps,
  Tag,
};
