import { Pressable, View, type PressableProps } from 'react-native';
import { cva } from 'class-variance-authority';
import { Paperclip, Repeat } from 'lucide-react-native';

import { Amount, IconTile, Tag, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatCents } from '@/shared/money';
import type { EntryListItem } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

import { entryMeta, entryTitle } from '../lib/entryList';
import { categoryStyle } from './categoryStyle';

const entryRowVariants = cva('min-h-[76px] flex-row items-center gap-3 px-4 py-3', {
  variants: {
    pressable: { true: 'active:bg-surface', false: '' },
  },
  defaultVariants: { pressable: false },
});

type EntryRowProps = Omit<PressableProps, 'children'> & {
  entry: EntryListItem;
  /** Hairline under the row, inset past the icon. */
  divider?: boolean;
};

function spokenLabel(entry: EntryListItem) {
  const direction = entry.kind === 'income' ? 'Income' : 'Expense';
  const extras = [
    entry.isCapital ? 'capital improvement' : null,
    entry.isRecurring ? 'repeats monthly' : null,
    entry.hasReceipt ? 'receipt attached' : null,
  ].filter((part) => part !== null);
  return [
    `${direction} ${formatCents(entry.amountCents)}, ${entryTitle(entry)}`,
    entryMeta(entry),
    entry.note,
    ...extras,
  ]
    .filter((part) => part !== null && part !== '')
    .join(', ');
}

/**
 * One saved entry: a category tile, the category and where it went, an optional note, and the
 * signed amount (green in, red out) with small markers for a receipt or a monthly repeat.
 */
function EntryRow({ entry, divider = false, onPress, className, ...rest }: EntryRowProps) {
  const { icon, tone } = categoryStyle(entry.category.key, entry.kind);

  return (
    <Pressable
      accessible
      accessibilityRole={onPress === undefined ? 'text' : 'button'}
      accessibilityLabel={spokenLabel(entry)}
      disabled={onPress === undefined}
      onPress={onPress}
      className={cn(entryRowVariants({ pressable: onPress !== undefined }), className)}
      {...rest}
    >
      <IconTile tone={tone} icon={icon} />

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text weight="semibold" size="md" numberOfLines={1} className="shrink">
            {entryTitle(entry)}
          </Text>
          {entry.isCapital ? <Tag label="Capital" tone="violet" /> : null}
        </View>
        <Text size="sm" tone="grey" numberOfLines={1}>
          {entryMeta(entry)}
        </Text>
        {entry.note === null || entry.note === '' ? null : (
          <Text size="sm" tone="muted" numberOfLines={1}>
            {entry.note}
          </Text>
        )}
      </View>

      <View className="items-end gap-1">
        <Amount
          cents={entry.amountCents}
          kind={entry.kind}
          showSign
          size="md"
          className="font-mono"
        />
        {entry.hasReceipt || entry.isRecurring ? (
          <View className="flex-row gap-1.5">
            {entry.isRecurring ? (
              <Repeat size={14} color={toneColor('grey')} strokeWidth={2} />
            ) : null}
            {entry.hasReceipt ? (
              <Paperclip size={14} color={toneColor('grey')} strokeWidth={2} />
            ) : null}
          </View>
        ) : null}
      </View>

      {divider ? <View className="absolute bottom-0 left-[72px] right-0 h-px bg-line" /> : null}
    </Pressable>
  );
}

export { entryRowVariants, type EntryRowProps, EntryRow };
