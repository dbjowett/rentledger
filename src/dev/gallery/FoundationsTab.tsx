import { Text as RNText, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/tokens';

import { Section } from './parts';

// Class names must be literal strings so Tailwind can find them.
const swatches = [
  { name: 'ink', hex: colors.ink, className: 'bg-ink' },
  { name: 'grey', hex: colors.grey, className: 'bg-grey' },
  { name: 'muted', hex: colors.muted, className: 'bg-muted' },
  { name: 'line', hex: colors.line, className: 'bg-line' },
  { name: 'outline', hex: colors.outline, className: 'bg-outline' },
  { name: 'surface', hex: colors.surface, className: 'bg-surface' },
  { name: 'card', hex: colors.card, className: 'bg-card' },
  { name: 'accent', hex: colors.accent.DEFAULT, className: 'bg-accent' },
  { name: 'accent-tint', hex: colors.accent.tint, className: 'bg-accent-tint' },
  { name: 'success', hex: colors.success.DEFAULT, className: 'bg-success' },
  { name: 'success-tint', hex: colors.success.tint, className: 'bg-success-tint' },
  { name: 'warning', hex: colors.warning.DEFAULT, className: 'bg-warning' },
  { name: 'warning-tint', hex: colors.warning.tint, className: 'bg-warning-tint' },
  { name: 'danger', hex: colors.danger.DEFAULT, className: 'bg-danger' },
  { name: 'danger-tint', hex: colors.danger.tint, className: 'bg-danger-tint' },
  { name: 'slate', hex: colors.slate.DEFAULT, className: 'bg-slate' },
  { name: 'slate-tint', hex: colors.slate.tint, className: 'bg-slate-tint' },
  { name: 'violet', hex: colors.violet.DEFAULT, className: 'bg-violet' },
  { name: 'violet-tint', hex: colors.violet.tint, className: 'bg-violet-tint' },
];

const typeScale = [
  { name: 'xs · 12', className: 'text-xs' },
  { name: 'sm · 13', className: 'text-sm' },
  { name: 'base · 14', className: 'text-base' },
  { name: 'md · 16', className: 'text-md' },
  { name: 'lg · 17', className: 'text-lg' },
  { name: 'xl · 18', className: 'text-xl' },
  { name: '2xl · 22', className: 'text-2xl' },
  { name: '3xl · 28', className: 'text-3xl' },
  { name: '4xl · 34', className: 'text-4xl' },
];

const families = [
  { name: 'font-sans (Inter 400)', className: 'font-sans' },
  { name: 'font-medium (Inter 500)', className: 'font-medium' },
  { name: 'font-semibold (Inter 600)', className: 'font-semibold' },
  { name: 'font-bold (Inter 700)', className: 'font-bold' },
  { name: 'font-mono $1,240.00', className: 'font-mono' },
];

const radii = [
  { name: 'tile · 14', className: 'rounded-tile' },
  { name: 'card · 22', className: 'rounded-card' },
  { name: 'sheet · 24', className: 'rounded-sheet' },
];

// Token previews use RN Text directly so they show the raw classes.
export function FoundationsTab() {
  return (
    <>
      <Section title="Colours">
        <View className="flex-row flex-wrap gap-3">
          {swatches.map((s) => (
            <View key={s.name} className="w-[30%]">
              <View className={cn('h-14 rounded-tile border border-line', s.className)} />
              <RNText className="mt-1 font-medium text-sm text-ink">{s.name}</RNText>
              <RNText className="font-sans text-xs text-grey">{s.hex}</RNText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type scale">
        {typeScale.map((t) => (
          <RNText key={t.name} className={cn('font-sans text-ink', t.className)}>
            {t.name}
          </RNText>
        ))}
      </Section>

      <Section title="Font families">
        {families.map((f) => (
          <RNText key={f.name} className={cn('text-lg text-ink', f.className)}>
            {f.name}
          </RNText>
        ))}
      </Section>

      <Section title="Radii">
        <View className="flex-row gap-3">
          {radii.map((r) => (
            <View key={r.name} className="items-center">
              <View className={cn('h-16 w-16 bg-accent-tint', r.className)} />
              <RNText className="mt-1 font-sans text-xs text-grey">{r.name}</RNText>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}
