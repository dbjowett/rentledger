import { useState } from 'react';
import { View } from 'react-native';

import { NeedsAttentionCard, type NeedsAttentionItem } from '@/components/NeedsAttentionCard';

import { Label, Section } from './parts';

const noop = () => undefined;

const defaultItems: NeedsAttentionItem[] = [
  {
    id: 'r1',
    type: 'rent',
    title: 'Unit 2 rent',
    amountCents: 180_000,
    meta: 'Due Oct 1',
    daysLate: 7,
  },
  { id: 'r2', type: 'rent', title: 'Unit 1 rent', amountCents: 165_000, meta: 'Due Oct 1' },
  {
    id: 'm1',
    type: 'mortgage',
    title: 'Mortgage payment',
    amountCents: 212_000,
    meta: 'Interest split estimated',
  },
  { id: 'b1', type: 'bill', title: 'Hydro Ottawa', amountCents: 14_320, meta: 'Due Oct 14' },
  { id: 'x1', type: 'match', title: 'Receipt from Oct 3', meta: '2 possible matches' },
];

const singleItem: NeedsAttentionItem[] = [
  {
    id: 'rc1',
    type: 'receipt',
    title: 'Home Depot',
    amountCents: 8999,
    meta: 'Repairs · No receipt yet',
  },
];

const stateItems: NeedsAttentionItem[] = [
  { id: 's1', type: 'rent', title: 'Unit 2 rent', amountCents: 180_000, state: 'done' },
  {
    id: 's2',
    type: 'receipt',
    title: 'Home Depot',
    amountCents: 8999,
    meta: 'Uploading photo',
    state: 'uploading',
  },
  { id: 's3', type: 'bill', title: 'Enbridge Gas', amountCents: 9150, meta: 'Due Oct 20' },
];

function InteractiveDemo() {
  const [items, setItems] = useState<NeedsAttentionItem[]>(defaultItems);

  const setState = (ids: string[], state: NeedsAttentionItem['state']) => {
    setItems((current) =>
      current.map((item) => (ids.includes(item.id) ? { ...item, state } : item)),
    );
  };

  const run = (ids: string[]) => {
    setState(ids, 'uploading');
    setTimeout(() => setState(ids, 'done'), 1200);
  };

  const expectedIds = items
    .filter((item) => (item.type === 'rent' || item.type === 'bill') && item.state === undefined)
    .map((item) => item.id);

  return (
    <NeedsAttentionCard
      items={items}
      onAction={(item) => run([item.id])}
      onSeeAll={noop}
      onConfirmAll={() => run(expectedIds)}
    />
  );
}

export function FeaturesTab() {
  return (
    <>
      <Section title="NeedsAttentionCard">
        <View className="gap-4">
          <View>
            <Label>default (3 of 5 rows, footer)</Label>
            <NeedsAttentionCard
              items={defaultItems}
              onAction={noop}
              onSeeAll={noop}
              onConfirmAll={noop}
            />
          </View>
          <View>
            <Label>single item, no footer</Label>
            <NeedsAttentionCard
              items={singleItem}
              onAction={noop}
              onSeeAll={noop}
              onConfirmAll={noop}
            />
          </View>
          <View>
            <Label>row states: done, uploading, pending</Label>
            <NeedsAttentionCard
              items={stateItems}
              onAction={noop}
              onSeeAll={noop}
              onConfirmAll={noop}
            />
          </View>
          <View>
            <Label>interactive: tap Confirm or the footer</Label>
            <InteractiveDemo />
          </View>
        </View>
      </Section>
    </>
  );
}
