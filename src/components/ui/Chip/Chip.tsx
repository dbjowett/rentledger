import { Pressable, View, type PressableProps } from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const chipVariants = cva('items-center justify-center border px-4 active:opacity-80', {
  variants: {
    selected: {
      true: 'border-accent bg-accent-tint',
      false: 'border-outline bg-card',
    },
    stacked: {
      true: 'min-h-[52px] rounded-tile py-2',
      false: 'h-9 rounded-full',
    },
    disabled: { true: 'opacity-50', false: '' },
  },
  defaultVariants: { selected: false, stacked: false, disabled: false },
});

const chipTextVariants = cva('font-semibold text-base', {
  variants: {
    selected: { true: 'text-accent', false: 'text-ink' },
  },
  defaultVariants: { selected: false },
});

const chipSublabelTextVariants = cva('mt-0.5 font-sans text-sm', {
  variants: {
    selected: { true: 'text-accent', false: 'text-grey' },
  },
  defaultVariants: { selected: false },
});

type ChipProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
};

function Chip({
  label,
  sublabel,
  selected = false,
  disabled = false,
  className,
  ...rest
}: ChipProps) {
  const stacked = sublabel !== undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={stacked ? `${label}, ${sublabel}` : label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={stacked ? 0 : 4}
      className={cn(chipVariants({ selected, stacked, disabled }), className)}
      {...rest}
    >
      <View className="items-center">
        <Text numberOfLines={1} className={chipTextVariants({ selected })}>
          {label}
        </Text>
        {stacked && (
          <Text numberOfLines={1} className={chipSublabelTextVariants({ selected })}>
            {sublabel}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export { chipVariants, chipTextVariants, chipSublabelTextVariants, type ChipProps, Chip };
