import { useState } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { formatDayOrdinal, type DueDay } from '@/shared/dates';

import { Chip } from '../Chip/Chip';
import { useField } from '../Field/Field';
import { Sheet } from '../Sheet/Sheet';
import { Text } from '../Text/Text';

const LAST_FIXED_DAY = 28;
const QUICK_DAYS = [1, 15] as const;
const GRID_COLUMNS = 7;

const dueDayCellVariants = cva('aspect-square items-center justify-center rounded-full', {
  variants: {
    selected: { true: 'bg-accent', false: 'active:bg-surface' },
  },
  defaultVariants: { selected: false },
});

const dueDayCellTextVariants = cva('font-medium text-md', {
  variants: {
    selected: { true: 'text-white', false: 'text-ink' },
  },
  defaultVariants: { selected: false },
});

type DueDayPickerProps = ViewProps & {
  value: DueDay;
  onChange: (value: DueDay) => void;
};

const days = Array.from({ length: LAST_FIXED_DAY }, (_, index) => index + 1);

function isQuickDay(value: DueDay) {
  return value.type === 'day' && QUICK_DAYS.some((day) => day === value.day);
}

function isSameDay(value: DueDay, day: number) {
  return value.type === 'day' && value.day === day;
}

function DayCell({
  day,
  selected,
  onPress,
}: {
  day: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View style={{ width: `${100 / GRID_COLUMNS}%` }} className="p-1">
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={formatDayOrdinal(day)}
        onPress={onPress}
        className={dueDayCellVariants({ selected })}
      >
        <Text className={dueDayCellTextVariants({ selected })}>{day}</Text>
      </Pressable>
    </View>
  );
}

/**
 * Picks when rent is due: 1st, 15th, last day, or any other day 1–28. Days 29–31 aren't offered
 * because not every month has them; "Last day" covers the end of the month.
 */
function DueDayPicker({ value, onChange, className, ...rest }: DueDayPickerProps) {
  const field = useField();
  const [sheetOpen, setSheetOpen] = useState(false);
  const otherSelected = value.type === 'day' && !isQuickDay(value);

  const choose = (next: DueDay) => {
    onChange(next);
    setSheetOpen(false);
  };

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={field.label}
      className={cn('flex-row flex-wrap gap-2', className)}
      {...rest}
    >
      {QUICK_DAYS.map((day) => (
        <Chip
          key={day}
          label={formatDayOrdinal(day)}
          selected={isSameDay(value, day)}
          onPress={() => onChange({ type: 'day', day })}
        />
      ))}
      <Chip
        label="Last day"
        selected={value.type === 'last'}
        onPress={() => onChange({ type: 'last' })}
      />
      <Chip
        label={otherSelected ? `Other: ${formatDayOrdinal(value.day)}` : 'Other'}
        selected={otherSelected}
        onPress={() => setSheetOpen(true)}
      />

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Rent due on the">
        <View accessibilityRole="radiogroup" className="flex-row flex-wrap">
          {days.map((day) => (
            <DayCell
              key={day}
              day={day}
              selected={isSameDay(value, day)}
              onPress={() => choose({ type: 'day', day })}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: value.type === 'last' }}
          onPress={() => choose({ type: 'last' })}
          className={cn(
            'mt-3 min-h-12 items-center justify-center rounded-tile',
            value.type === 'last' ? 'bg-accent' : 'bg-surface active:bg-line',
          )}
        >
          <Text weight="semibold" tone={value.type === 'last' ? 'white' : 'ink'}>
            Last day of the month
          </Text>
        </Pressable>
        <Text size="sm" tone="grey" className="mt-3 text-center">
          29th–31st aren't in every month, so use "Last day" for the end of the month.
        </Text>
      </Sheet>
    </View>
  );
}

export { dueDayCellTextVariants, dueDayCellVariants, type DueDayPickerProps, DueDayPicker };
