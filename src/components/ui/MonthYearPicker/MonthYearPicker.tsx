import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cva } from 'class-variance-authority';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { formatMonthShort, formatMonthYear, monthsBetween, type MonthStart } from '@/shared/dates';
import { toneColor } from '@/theme/tokens';

import { useField } from '../Field/Field';
import { IconButton } from '../IconButton/IconButton';
import { Sheet } from '../Sheet/Sheet';
import { Text } from '../Text/Text';
import { inputContainerVariants, resolveInputState } from '../TextInput/TextInput';

const MONTHS_PER_ROW = 3;

const monthCellVariants = cva('h-12 items-center justify-center rounded-tile', {
  variants: {
    selected: { true: 'bg-accent', false: 'bg-surface active:bg-line' },
    disabled: { true: 'opacity-40', false: '' },
  },
  defaultVariants: { selected: false, disabled: false },
});

type MonthYearPickerProps = {
  value: MonthStart;
  onChange: (value: MonthStart) => void;
  /** Latest month that can be picked, e.g. 12 months after the current one. */
  maxMonth?: MonthStart;
  /** Earliest month that can be picked. */
  minMonth?: MonthStart;
  invalid?: boolean;
  /** Sheet title; defaults to the Field's label. */
  title?: string;
  className?: string;
};

function yearOf(month: MonthStart): number {
  return Number(month.slice(0, 4));
}

function monthsOfYear(year: number): MonthStart[] {
  return Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, '0')}-01`,
  );
}

function isOutside(month: MonthStart, minMonth?: MonthStart, maxMonth?: MonthStart) {
  if (maxMonth !== undefined && monthsBetween(maxMonth, month) > 0) return true;
  return minMonth !== undefined && monthsBetween(minMonth, month) < 0;
}

/** A field showing "October 2026" that opens a month grid with a year switcher. */
function MonthYearPicker({
  value,
  onChange,
  maxMonth,
  minMonth,
  invalid,
  title,
  className,
}: MonthYearPickerProps) {
  const field = useField();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => yearOf(value));
  const state = resolveInputState({
    focused: open,
    invalid: invalid ?? field.invalid,
    disabled: false,
  });

  const openSheet = () => {
    setYear(yearOf(value));
    setOpen(true);
  };

  const choose = (month: MonthStart) => {
    onChange(month);
    setOpen(false);
  };

  const canGoBack = minMonth === undefined || yearOf(minMonth) < year;
  const canGoForward = maxMonth === undefined || yearOf(maxMonth) > year;
  const months = monthsOfYear(year);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${field.label ?? title ?? 'Month'}, ${formatMonthYear(value)}`}
        accessibilityHint={field.description}
        onPress={openSheet}
        className={cn(inputContainerVariants({ state }), className)}
      >
        <Text className="flex-1 text-md">{formatMonthYear(value)}</Text>
        <CalendarDays size={18} color={toneColor('grey')} strokeWidth={2} />
      </Pressable>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={title ?? field.label ?? 'Pick a month'}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Previous year"
            disabled={!canGoBack}
            onPress={() => setYear((current) => current - 1)}
          />
          <Text accessibilityRole="header" weight="semibold" size="lg">
            {String(year)}
          </Text>
          <IconButton
            icon={ChevronRight}
            accessibilityLabel="Next year"
            disabled={!canGoForward}
            onPress={() => setYear((current) => current + 1)}
          />
        </View>
        <View accessibilityRole="radiogroup" className="flex-row flex-wrap">
          {months.map((month) => {
            const selected = month === value;
            const disabled = isOutside(month, minMonth, maxMonth);
            return (
              <View key={month} style={{ width: `${100 / MONTHS_PER_ROW}%` }} className="p-1">
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={formatMonthYear(month)}
                  accessibilityState={{ checked: selected, disabled }}
                  disabled={disabled}
                  onPress={() => choose(month)}
                  className={monthCellVariants({ selected, disabled })}
                >
                  <Text weight="medium" tone={selected ? 'white' : 'ink'}>
                    {formatMonthShort(month)}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}

export { monthCellVariants, type MonthYearPickerProps, MonthYearPicker };
