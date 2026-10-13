import { cva } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { Amount, type AmountProps } from '../Amount/Amount';
import { Text } from '../Text/Text';

const listRowVariants = cva('flex-row items-center gap-3 px-4', {
  variants: {
    pressable: { true: 'active:bg-surface', false: '' },
  },
  defaultVariants: { pressable: false },
});

// The right-hand part carries the divider so it starts after the leading slot.
const listRowContentVariants = cva('min-h-[76px] flex-1 flex-row items-center gap-3 py-4', {
  variants: {
    divider: { true: 'border-b border-line', false: '' },
  },
  defaultVariants: { divider: false },
});

const listRowTitleTextVariants = cva('shrink font-semibold text-md text-ink');
const listRowMetaTextVariants = cva('mt-0.5 font-sans text-base text-grey');

type ListRowProps = Omit<PressableProps, 'children'> & {
  title: string;
  /** Right after the title, e.g. <Text tone="danger">7d late</Text> or a Tag. */
  titleAccessory?: ReactNode;
  /** Secondary line in grey. */
  meta?: string;
  /** Leads the meta line, followed by " · ". */
  metaAmount?: Pick<AmountProps, 'cents' | 'kind' | 'showSign' | 'hideCents'>;
  /** IconTile, thumbnail, or nothing. */
  leading?: ReactNode;
  /** Button, Amount, Tag, etc. */
  trailing?: ReactNode;
  /** Shows a chevron after `trailing`; use for rows that navigate. */
  chevron?: boolean;
  /** Inset hairline below the row. */
  divider?: boolean;
};

function ListRow({
  title,
  titleAccessory,
  meta,
  metaAmount,
  leading,
  trailing,
  chevron = false,
  divider = false,
  onPress,
  className,
  ...rest
}: ListRowProps) {
  const hasMeta = Boolean(meta) || metaAmount !== undefined;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={cn(listRowVariants({ pressable: Boolean(onPress) }), className)}
      {...rest}
    >
      {leading}
      <View className={listRowContentVariants({ divider })}>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={1} className={listRowTitleTextVariants()}>
              {title}
            </Text>
            {titleAccessory != null && <View>{titleAccessory}</View>}
          </View>
          {hasMeta && (
            <Text numberOfLines={1} className={listRowMetaTextVariants()}>
              {metaAmount && <Amount size="base" {...metaAmount} />}
              {metaAmount !== undefined && Boolean(meta) ? ' · ' : null}
              {meta}
            </Text>
          )}
        </View>
        {/* Wrapper centres Buttons/Tags, which are self-start so they don't stretch in columns. */}
        {trailing != null && <View>{trailing}</View>}
        {chevron && <ChevronRight size={20} color={toneColor('muted')} />}
      </View>
    </Pressable>
  );
}

export {
  listRowVariants,
  listRowContentVariants,
  listRowTitleTextVariants,
  listRowMetaTextVariants,
  type ListRowProps,
  ListRow,
};
