import { View } from 'react-native';
import { Check } from 'lucide-react-native';

import {
  Button,
  Card,
  SegmentedControl,
  SplitBar,
  Text,
  TextInput,
  splitBarSegmentVariants,
  type SegmentOption,
  type SplitBarTone,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatCents } from '@/shared/money';
import { toneColor } from '@/theme/tokens';

import type { SplitMode } from '../lib/entry';
import {
  basisPointsToPercent,
  evenBasisPoints,
  percentToBasisPoints,
  splitAmounts,
  splitStatus,
} from '../lib/split';

/** Colours for units in a split, in order; repeats after six. */
const SPLIT_TONES: readonly SplitBarTone[] = [
  'accent',
  'accentSoft',
  'violet',
  'slate',
  'success',
  'warning',
];

const modeOptions: Array<SegmentOption<SplitMode>> = [
  { value: 'even', label: 'Evenly' },
  { value: 'custom', label: 'Custom' },
];

type SplitCardUnit = { id: string; label: string };

type SplitCardProps = {
  /** Selected units, in property order. */
  units: readonly SplitCardUnit[];
  amountCents: number | null;
  mode: SplitMode;
  onModeChange: (mode: SplitMode) => void;
  /** Typed percentages per unit id (custom mode). */
  percents: Readonly<Record<string, string>>;
  onPercentChange: (unitId: string, percent: string) => void;
  onResetToEven: () => void;
};

function toneAt(index: number): SplitBarTone {
  return SPLIT_TONES[index % SPLIT_TONES.length] ?? 'accent';
}

function StatusLine({
  ok,
  offByPercent,
  amountCents,
  showReset,
  onReset,
}: {
  ok: boolean;
  offByPercent: number;
  amountCents: number;
  showReset: boolean;
  onReset: () => void;
}) {
  const sign = offByPercent > 0 ? '+' : '';
  return (
    <View
      accessibilityLiveRegion="polite"
      className={cn(
        'min-h-11 flex-row items-center gap-2 rounded-tile px-3',
        ok ? 'bg-success-tint' : 'bg-danger-tint',
      )}
    >
      {ok ? <Check size={16} color={toneColor('success')} strokeWidth={2.5} /> : null}
      <Text size="base" weight="semibold" tone={ok ? 'success' : 'danger'} className="flex-1">
        {ok ? `Total 100% · ${formatCents(amountCents)}` : `Off by ${sign}${offByPercent}%`}
      </Text>
      {showReset ? (
        <Button variant="link" size="sm" label="Reset to even" onPress={onReset} />
      ) : null}
    </View>
  );
}

/** How a cost is shared between 2+ units: evenly, or by custom percentages that total 100%. */
function SplitCard({
  units,
  amountCents,
  mode,
  onModeChange,
  percents,
  onPercentChange,
  onResetToEven,
}: SplitCardProps) {
  const basisPoints =
    mode === 'even'
      ? evenBasisPoints(units.length)
      : units.map((unit) => percentToBasisPoints(percents[unit.id] ?? '') ?? 0);
  const amounts = splitAmounts(amountCents ?? 0, basisPoints);
  const status = splitStatus(basisPoints);

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <Text weight="semibold" size="md" className="flex-1">
          {`Split between ${units.length} units`}
        </Text>
        <SegmentedControl
          accessibilityLabel="Split"
          size="sm"
          options={modeOptions}
          value={mode}
          onChange={onModeChange}
          className="w-44"
        />
      </View>

      <SplitBar
        size="sm"
        segments={units.map((unit, index) => ({
          key: unit.id,
          label: unit.label,
          value: basisPoints[index] ?? 0,
          tone: toneAt(index),
        }))}
      />

      <View>
        {units.map((unit, index) => (
          <View
            key={unit.id}
            className={cn(
              'min-h-12 flex-row items-center gap-3 py-1',
              index < units.length - 1 && 'border-b border-line',
            )}
          >
            <View className={cn(splitBarSegmentVariants({ tone: toneAt(index) }), 'h-2.5 w-2.5')} />
            <Text size="md" numberOfLines={1} className="flex-1">
              {unit.label}
            </Text>
            {mode === 'custom' ? (
              <TextInput
                accessibilityLabel={`${unit.label} share`}
                value={percents[unit.id] ?? ''}
                onChangeText={(text) => onPercentChange(unit.id, text)}
                keyboardType="decimal-pad"
                inputMode="decimal"
                suffix="%"
                placeholder="0"
                maxLength={6}
                containerClassName="h-10 w-24"
                className="text-right font-mono"
              />
            ) : (
              <Text size="md" tone="grey" className="w-24 text-right font-mono">
                {`${basisPointsToPercent(basisPoints[index] ?? 0)}%`}
              </Text>
            )}
            <Text size="md" className="w-24 text-right font-mono">
              {formatCents(amounts[index] ?? 0)}
            </Text>
          </View>
        ))}
      </View>

      <StatusLine
        ok={status.ok}
        offByPercent={status.ok ? 0 : status.offByPercent}
        amountCents={amountCents ?? 0}
        showReset={mode === 'custom'}
        onReset={onResetToEven}
      />
    </Card>
  );
}

export { SPLIT_TONES, type SplitCardProps, type SplitCardUnit, SplitCard };
