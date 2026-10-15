import { Pressable } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { formatDateMedium, parseIsoDate, toIsoDate, type IsoDate } from '@/shared/dates';
import { toneColor } from '@/theme/tokens';

import { useField } from '../Field/Field';
import { Text } from '../Text/Text';
import { inputContainerVariants, resolveInputState } from '../TextInput/TextInput';

type DateFieldProps = {
  value: IsoDate;
  onChange: (value: IsoDate) => void;
  /** Latest day that can be picked. */
  maxDate?: IsoDate;
  /** Earliest day that can be picked. */
  minDate?: IsoDate;
  invalid?: boolean;
  className?: string;
};

/** A field showing "Oct 14, 2026" that opens the system date picker (Android). */
function DateField({ value, onChange, maxDate, minDate, invalid, className }: DateFieldProps) {
  const field = useField();
  const state = resolveInputState({
    focused: false,
    invalid: invalid ?? field.invalid,
    disabled: false,
  });

  const open = () => {
    DateTimePickerAndroid.open({
      value: parseIsoDate(value),
      mode: 'date',
      maximumDate: maxDate === undefined ? undefined : parseIsoDate(maxDate),
      minimumDate: minDate === undefined ? undefined : parseIsoDate(minDate),
      onValueChange: (_event, date) => onChange(toIsoDate(date)),
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${field.label ?? 'Date'}, ${formatDateMedium(value)}`}
      accessibilityHint={field.description}
      onPress={open}
      className={cn(inputContainerVariants({ state }), className)}
    >
      <Text className="flex-1 text-md">{formatDateMedium(value)}</Text>
      <CalendarDays size={18} color={toneColor('grey')} strokeWidth={2} />
    </Pressable>
  );
}

export { type DateFieldProps, DateField };
