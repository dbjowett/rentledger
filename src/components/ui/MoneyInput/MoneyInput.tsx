import { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import {
  centsToEditText,
  formatCentsGrouped,
  parseMoneyText,
  sanitizeMoneyText,
} from '@/shared/money';
import { toneColor } from '@/theme/tokens';

import { useField } from '../Field/Field';
import { Text } from '../Text/Text';
import { inputContainerVariants, resolveInputState, useFocusState } from '../TextInput/TextInput';

const moneyInputContainerVariants = cva('', {
  variants: {
    size: { lg: 'h-16', sm: 'h-12' },
  },
  defaultVariants: { size: 'lg' },
});

const moneyInputTextVariants = cva('flex-1 p-0 font-mono', {
  variants: {
    size: { lg: 'text-3xl', sm: 'text-md' },
    disabled: { true: 'text-grey', false: 'text-ink' },
  },
  defaultVariants: { size: 'lg', disabled: false },
});

const moneyInputPrefixTextVariants = cva('mr-1 font-mono', {
  variants: {
    size: { lg: 'text-3xl', sm: 'text-md' },
    empty: { true: 'text-muted', false: 'text-ink' },
  },
  defaultVariants: { size: 'lg', empty: false },
});

const moneyInputSuffixTextVariants = cva('ml-1 font-sans text-grey', {
  variants: {
    size: { lg: 'text-lg', sm: 'text-sm' },
  },
  defaultVariants: { size: 'lg' },
});

type MoneyInputSize = 'lg' | 'sm';

type MoneyInputProps = Omit<
  RNTextInputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'keyboardType' | 'inputMode'
> & {
  /** Amount in cents; null when empty. */
  cents: number | null;
  onChangeCents: (cents: number | null) => void;
  invalid?: boolean;
  containerClassName?: string;
  /** `lg` for a screen's main amount, `sm` inside forms and cards. */
  size?: MoneyInputSize;
  /** Muted text after the amount, e.g. "/mo". */
  suffix?: string;
};

function MoneyInput({
  cents,
  onChangeCents,
  invalid,
  editable = true,
  placeholder = '0.00',
  size = 'lg',
  suffix,
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
  const shown = focused ? draft : formatCentsGrouped(cents);

  const handleChange = (text: string) => {
    const next = sanitizeMoneyText(text);
    setDraft(next);
    onChangeCents(parseMoneyText(next));
  };

  return (
    <View
      className={cn(
        inputContainerVariants({ state }),
        moneyInputContainerVariants({ size }),
        containerClassName,
      )}
    >
      <Text className={moneyInputPrefixTextVariants({ size, empty: shown === '' })}>$</Text>
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
        className={cn(moneyInputTextVariants({ size, disabled }), className)}
        {...handlers}
        {...rest}
      />
      {suffix === undefined ? null : (
        <Text importantForAccessibility="no" className={moneyInputSuffixTextVariants({ size })}>
          {suffix}
        </Text>
      )}
    </View>
  );
}

export {
  moneyInputContainerVariants,
  moneyInputTextVariants,
  moneyInputPrefixTextVariants,
  moneyInputSuffixTextVariants,
  type MoneyInputProps,
  type MoneyInputSize,
  MoneyInput,
};
