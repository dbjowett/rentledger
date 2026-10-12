import { View } from 'react-native';

import {
  Amount,
  Text,
  type AmountProps,
  type TextSize,
  type TextTone,
  type TextWeight,
} from '@/components/ui';

import { Section } from './parts';

const textSizes: TextSize[] = ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
const textWeights: TextWeight[] = ['regular', 'medium', 'semibold', 'bold'];
const textTones: TextTone[] = ['ink', 'grey', 'muted', 'accent', 'success', 'warning', 'danger'];

const amounts: Array<{ label: string; props: AmountProps }> = [
  {
    label: 'income, showSign, hideCents',
    props: { cents: 180_000, kind: 'income', showSign: true, hideCents: true },
  },
  {
    label: 'expense, showSign, hideCents',
    props: { cents: 24_000, kind: 'expense', showSign: true, hideCents: true },
  },
  { label: 'neutral', props: { cents: 210_000 } },
  { label: 'income, no sign', props: { cents: 124_050, kind: 'income' } },
  { label: 'expense, showSign', props: { cents: 8999, kind: 'expense', showSign: true } },
  { label: 'neutral, negative', props: { cents: -31_250 } },
  { label: 'neutral, showSign', props: { cents: 5000, showSign: true } },
  { label: 'zero, showSign', props: { cents: 0, showSign: true } },
  { label: 'large', props: { cents: 123_456_789 } },
];

export function TextTab() {
  return (
    <>
      <Section title="Text · size">
        {textSizes.map((s) => (
          <Text key={s} size={s}>
            {s}
          </Text>
        ))}
      </Section>

      <Section title="Text · weight">
        {textWeights.map((w) => (
          <Text key={w} size="lg" weight={w}>
            {w}
          </Text>
        ))}
      </Section>

      <Section title="Text · tone">
        {textTones.map((t) => (
          <Text key={t} weight="medium" tone={t}>
            {t}
          </Text>
        ))}
        <View className="mt-1 self-start rounded-tile bg-ink px-3 py-1">
          <Text weight="medium" tone="white">
            white
          </Text>
        </View>
      </Section>

      <Section title="Amount">
        {amounts.map((a) => (
          <View
            key={a.label}
            className="flex-row items-baseline justify-between border-b border-line py-2"
          >
            <Text size="sm" tone="grey">
              {a.label}
            </Text>
            <Amount size="lg" {...a.props} />
          </View>
        ))}
        <View className="mt-4 gap-1">
          {textSizes.map((s) => (
            <Amount key={s} size={s} cents={124_000} kind="income" showSign />
          ))}
        </View>
      </Section>
    </>
  );
}
