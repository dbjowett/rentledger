import { View } from 'react-native';
import { CheckCheck, ChevronRight } from 'lucide-react-native';

import {
  Button,
  Card,
  CountBadge,
  IconTile,
  ListRow,
  Text,
  type ButtonProps,
} from '@/components/ui';
import { toneColor } from '@/theme/tokens';

type NeedsAttentionType = 'rent' | 'bill' | 'mortgage' | 'receipt' | 'match';
type NeedsAttentionState = 'pending' | 'uploading' | 'done';

type NeedsAttentionItem = {
  id: string;
  type: NeedsAttentionType;
  title: string;
  amountCents?: number;
  meta?: string;
  daysLate?: number;
  state?: NeedsAttentionState;
};

type NeedsAttentionCardProps = {
  items: NeedsAttentionItem[];
  onAction: (item: NeedsAttentionItem) => void;
  onSeeAll?: () => void;
  onConfirmAll?: () => void;
  className?: string;
};

const MAX_ROWS = 3;

const actions: Record<NeedsAttentionType, Pick<ButtonProps, 'label' | 'variant'>> = {
  rent: { label: 'Confirm', variant: 'primary' },
  bill: { label: 'Confirm', variant: 'primary' },
  mortgage: { label: 'Review', variant: 'secondary' },
  receipt: { label: 'Add', variant: 'secondary' },
  match: { label: 'Match', variant: 'secondary' },
};

const isExpected = (item: NeedsAttentionItem) =>
  (item.type === 'rent' || item.type === 'bill') && (item.state ?? 'pending') === 'pending';

function confirmAllLabel(expected: NeedsAttentionItem[]) {
  const noun = expected.every((item) => item.type === 'rent') ? 'rents' : 'payments';
  return `Confirm ${expected.length} expected ${noun}`;
}

type RowProps = {
  item: NeedsAttentionItem;
  divider: boolean;
  onAction: (item: NeedsAttentionItem) => void;
};

function NeedsAttentionRow({ item, divider, onAction }: RowProps) {
  const state = item.state ?? 'pending';

  if (state === 'done') {
    return (
      <ListRow
        divider={divider}
        className="bg-success-tint"
        leading={<IconTile kind="done" className="bg-card" />}
        title={item.title}
        meta="Confirmed · added to entries"
      />
    );
  }

  const action = actions[item.type];
  const late = item.daysLate !== undefined && item.daysLate > 0;

  return (
    <ListRow
      divider={divider}
      leading={<IconTile kind={item.type} />}
      title={item.title}
      titleAccessory={
        late ? (
          <Text size="sm" weight="semibold" tone="danger">
            {`${item.daysLate}d late`}
          </Text>
        ) : undefined
      }
      metaAmount={
        item.amountCents === undefined ? undefined : { cents: item.amountCents, hideCents: true }
      }
      meta={item.meta}
      trailing={
        <Button
          size="sm"
          variant={state === 'uploading' ? 'ghost' : action.variant}
          label={action.label}
          accessibilityLabel={`${action.label} ${item.title}`}
          loading={state === 'uploading'}
          onPress={() => onAction(item)}
        />
      }
    />
  );
}

function NeedsAttentionCard({
  items,
  onAction,
  onSeeAll,
  onConfirmAll,
  className,
}: NeedsAttentionCardProps) {
  const rows = items.slice(0, MAX_ROWS);
  const expected = items.filter((item) => isExpected(item));

  return (
    <Card padding="none" className={className}>
      <Card.Header
        title="Needs attention"
        accessory={<CountBadge count={items.length} />}
        action={
          onSeeAll ? (
            <Button variant="link" size="sm" label="See all" onPress={onSeeAll} />
          ) : undefined
        }
        className="mb-0 px-4 pb-1 pt-4"
      />

      {rows.map((item, index) => (
        <NeedsAttentionRow
          key={item.id}
          item={item}
          divider={index < rows.length - 1}
          onAction={onAction}
        />
      ))}

      {expected.length >= 2 && onConfirmAll ? (
        <Card.Footer className="mt-0 px-4 pb-4">
          <Card variant="muted" padding="sm" onPress={onConfirmAll} className="flex-1 rounded-tile">
            <View className="flex-row items-center gap-2">
              <CheckCheck size={18} color={toneColor('accent')} />
              <Text weight="semibold" tone="accent" className="flex-1">
                {confirmAllLabel(expected)}
              </Text>
              <ChevronRight size={18} color={toneColor('accent')} />
            </View>
          </Card>
        </Card.Footer>
      ) : null}
    </Card>
  );
}

export {
  type NeedsAttentionType,
  type NeedsAttentionState,
  type NeedsAttentionItem,
  type NeedsAttentionCardProps,
  NeedsAttentionCard,
};
