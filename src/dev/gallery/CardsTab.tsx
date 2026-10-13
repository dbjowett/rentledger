import { useState } from 'react';
import { View } from 'react-native';
import { ChevronRight, MoreHorizontal } from 'lucide-react-native';

import {
  Amount,
  Button,
  Card,
  CountBadge,
  IconButton,
  SplitBar,
  Tag,
  Text,
  type CardProps,
} from '@/components/ui';
import { toneColor } from '@/theme/tokens';

import { Label, Section } from './parts';

const paddings: Array<NonNullable<CardProps['padding']>> = ['none', 'sm', 'md', 'lg'];

const plans = [
  { key: 'simple', title: 'Simple', body: 'Income and expenses only' },
  { key: 'tax', title: 'Tax-ready', body: 'Adds T776 lines and CCA' },
];

function SelectableDemo() {
  const [selected, setSelected] = useState('tax');
  return (
    <View className="gap-3">
      {plans.map((p) => (
        <Card
          key={p.key}
          variant={selected === p.key ? 'accent' : 'elevated'}
          onPress={() => setSelected(p.key)}
          accessibilityState={{ selected: selected === p.key }}
        >
          <Text weight="semibold" size="lg">
            {p.title}
          </Text>
          <Text size="base" tone="grey">
            {p.body}
          </Text>
        </Card>
      ))}
    </View>
  );
}

export function CardsTab() {
  return (
    <>
      <Section title="Card · variant">
        <View className="gap-3">
          <Card>
            <Text weight="semibold">elevated (default)</Text>
            <Text size="base" tone="grey">
              White, hairline border, radius 22
            </Text>
          </Card>
          <Card variant="muted" className="border border-dashed border-outline">
            <Text weight="semibold">muted</Text>
            <Text size="base" tone="grey">
              Surface background (dashed outline only here, to show it on the page)
            </Text>
          </Card>
          <Card variant="accent">
            <Text weight="semibold">accent</Text>
            <Text size="base" tone="grey">
              Selected state
            </Text>
          </Card>
        </View>
      </Section>

      <Section title="Card · padding">
        <View className="gap-3">
          {paddings.map((p) => (
            <Card key={p} padding={p}>
              <View className="rounded-tile bg-accent-tint px-2 py-1">
                <Text size="sm" weight="medium" tone="accent">
                  {`padding="${p}"`}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Card · pressable">
        <Label>tap a card to select it</Label>
        <SelectableDemo />
        <View className="mt-3">
          <Card onPress={() => {}}>
            <View className="flex-row items-center">
              <View className="flex-1">
                <Text weight="semibold">123 Maple St · Unit 2</Text>
                <Text size="base" tone="grey">
                  Lease ends Aug 31
                </Text>
              </View>
              <ChevronRight size={20} color={toneColor('muted')} />
            </View>
          </Card>
        </View>
      </Section>

      <Section title="SplitBar">
        <View className="gap-3">
          <Card>
            <Card.Header title="October mortgage" className="mb-2" />
            <Amount cents={212_000} size="2xl" />
            <SplitBar
              legend
              className="mt-3"
              segments={[
                { key: 'interest', label: 'Interest', value: 131_200, tone: 'warning' },
                { key: 'principal', label: 'Principal', value: 80_800, tone: 'accent' },
              ]}
            />
          </Card>
          <Card>
            <Card.Header title="Expense split by unit" className="mb-2" />
            <SplitBar
              legend
              segments={[
                { key: 'u1', label: 'Unit 1', value: 40, tone: 'accent' },
                { key: 'u2', label: 'Unit 2', value: 35, tone: 'violet' },
                { key: 'u3', label: 'Basement', value: 20, tone: 'success' },
                { key: 'own', label: 'Personal use', value: 5, tone: 'muted' },
              ]}
            />
          </Card>
          <Card>
            <Text size="sm" tone="grey" className="mb-2">
              size sm, tiny segment, zero filtered out
            </Text>
            <SplitBar
              size="sm"
              segments={[
                { key: 'a', value: 97, tone: 'success' },
                { key: 'b', value: 3, tone: 'danger' },
                { key: 'c', value: 0, tone: 'slate' },
              ]}
            />
            <Text size="sm" tone="grey" className="mb-2 mt-4">
              empty (all zero)
            </Text>
            <SplitBar segments={[{ key: 'a', value: 0, tone: 'accent' }]} />
          </Card>
        </View>
      </Section>

      <Section title="Card · compound">
        <View className="gap-3">
          <Card>
            <Card.Header
              title="Needs attention"
              accessory={<CountBadge count={3} />}
              action={<Button variant="link" size="sm" label="See all" />}
            />
            <Card.Body>
              <Text size="base" tone="grey">
                Card.Body stacks its children with a 12px gap.
              </Text>
              <View className="flex-row items-center justify-between rounded-tile bg-surface p-3">
                <Text weight="medium">October rent</Text>
                <Amount cents={180_000} kind="income" showSign hideCents />
              </View>
            </Card.Body>
            <Card.Footer>
              <Button variant="secondary" size="sm" label="Dismiss" />
              <Button size="sm" label="Confirm all" />
            </Card.Footer>
          </Card>

          <Card>
            <Card.Header
              title="A long header title that should truncate cleanly"
              accessory={<Tag tone="warning" label="Due" />}
              action={
                <IconButton size="sm" icon={MoreHorizontal} accessibilityLabel="More options" />
              }
            />
            <Card.Body>
              <Card variant="muted" padding="sm">
                <Text size="base">A muted card nested inside an elevated one.</Text>
              </Card>
            </Card.Body>
          </Card>

          <Card padding="none">
            <View className="p-4">
              <Card.Header title="padding none" className="mb-0" />
            </View>
            <View className="h-px bg-line" />
            <View className="p-4">
              <Text size="base" tone="grey">
                Full-bleed divider; sections add their own padding.
              </Text>
            </View>
          </Card>
        </View>
      </Section>
    </>
  );
}
