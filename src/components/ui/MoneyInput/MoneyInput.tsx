import { cva } from 'class-variance-authority';
import { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { useField } from '../Field/Field';
import { Text } from '../Text/Text';
import { inputContainerVariants, resolveInputState, useFocusState } from '../TextInput/TextInput';

const MAX_DOLLAR_DIGITS = 9;

const grouped = new Intl.NumberFormat('en-CA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatForDisplay = (cents: number | null) =>
  cents === null ? '' : grouped.format(cents / 100);

/** "1,240.5" → "1240.5": keeps digits and the first dot, at most 2 decimals. */
function sanitizeMoneyText(text: string): string {
  const cleaned = text.replaceAll(/[^\d.]/g, '');
  const [whole = '', ...fractionParts] = cleaned.split('.');
  const dollars = whole.replace(/^0+(?=\d)/, '').slice(0, MAX_DOLLAR_DIGITS);
  if (fractionParts.length === 0) return dollars;
  return `${dollars === '' ? '0' : dollars}.${fractionParts.join('').slice(0, 2)}`;
}

/** "1240.5" → 124050. Empty input is null, not 0. */
function parseMoneyText(text: string): number | null {
  if (text === '' || text === '.') return null;
  const [whole = '0', fraction = ''] = text.split('.');
  return Number(whole === '' ? '0' : whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/** 124050 → "1240.50" for editing; whole dollars drop the fraction. */
function centsToEditText(cents: number | null): string {
  if (cents === null) return '';
  const dollars = Math.trunc(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? String(dollars) : `${dollars}.${String(rest).padStart(2, '0')}`;
}

const moneyInputTextVariants = cva('flex-1 p-0 font-mono text-3xl', {
  variants: {
    disabled: { true: 'text-grey', false: 'text-ink' },
  },
  defaultVariants: { disabled: false },
});

const moneyInputPrefixTextVariants = cva('mr-1 font-mono text-3xl', {
  variants: {
    empty: { true: 'text-muted', false: 'text-ink' },
  },
  defaultVariants: { empty: false },
});

type MoneyInputProps = Omit<
  RNTextInputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'keyboardType' | 'inputMode'
> & {
  /** Amount in cents; null when empty. */
  cents: number | null;
  onChangeCents: (cents: number | null) => void;
  invalid?: boolean;
  containerClassName?: string;
};

function MoneyInput({
  cents,
  onChangeCents,
  invalid,
  editable = true,
  placeholder = '0.00',
  className,
  containerClassName,
  onFocus,
  onBlur,
  ...rest
}: MoneyInputProps) {
  const field = useField();
  const { focused, handlers } = useFocusState((event) => {
    setDraft(centsToEditText(cents));
    onFocus?.(event);
  }, onBlur);
  const [draft, setDraft] = useState(() => centsToEditText(cents));

  const disabled = !editable;
  const state = resolveInputState({ focused, invalid: invalid ?? field.invalid, disabled });
  const shown = focused ? draft : formatForDisplay(cents);

  const handleChange = (text: string) => {
    const next = sanitizeMoneyText(text);
    setDraft(next);
    onChangeCents(parseMoneyText(next));
  };

  return (
    <View className={cn(inputContainerVariants({ state }), 'h-16', containerClassName)}>
      <Text className={moneyInputPrefixTextVariants({ empty: shown === '' })}>$</Text>
      <RNTextInput
        accessibilityLabel={field.label}
        accessibilityHint={field.description}
        aria-required={field.required}
        aria-invalid={state === 'error'}
        value={shown}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        inputMode="decimal"
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={toneColor('muted')}
        selectionColor={toneColor('accent')}
        cursorColor={toneColor('accent')}
        className={cn(moneyInputTextVariants({ disabled }), className)}
        {...handlers}
        {...rest}
      />
    </View>
  );
}

export {
  sanitizeMoneyText,
  parseMoneyText,
  centsToEditText,
  moneyInputTextVariants,
  moneyInputPrefixTextVariants,
  type MoneyInputProps,
  MoneyInput,
};
