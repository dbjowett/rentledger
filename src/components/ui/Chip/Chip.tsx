import { Pressable, View, type PressableProps } from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Tag } from '../Tag/Tag';
import { Text } from '../Text/Text';

const chipVariants = cva('items-center justify-center border px-4 active:opacity-80', {
  variants: {
    selected: {
      true: 'border-ink bg-ink',
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
    selected: { true: 'text-white', false: 'text-ink' },
  },
  defaultVariants: { selected: false },
});

const chipSublabelTextVariants = cva('mt-0.5 font-sans text-sm', {
  variants: {
    selected: { true: 'text-muted', false: 'text-grey' },
  },
  defaultVariants: { selected: false },
});

type ChipProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Small tag after the label, e.g. "Yours". */
  tag?: string;
};

function Chip({
  label,
  sublabel,
  selected = false,
  disabled = false,
  tag,
  className,
  ...rest
}: ChipProps) {
  const stacked = sublabel !== undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[label, sublabel, tag].filter((part) => part !== undefined).join(', ')}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={stacked ? 0 : 4}
      className={cn(chipVariants({ selected, stacked, disabled }), className)}
      {...rest}
    >
      <View className="items-center">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className={chipTextVariants({ selected })}>
            {label}
          </Text>
          {tag === undefined ? null : <Tag label={tag} tone="accent" />}
        </View>
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
