import { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  type NativeSyntheticEvent,
  type TargetedEvent,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { useField } from '../Field/Field';
import { Text } from '../Text/Text';

// Border grows to 2px when focused or invalid; padding shrinks by 1px so text doesn't shift.
const inputContainerVariants = cva('flex-row items-center rounded-tile bg-card', {
  variants: {
    state: {
      default: 'border border-outline px-4',
      focused: 'border-2 border-accent px-[15px]',
      error: 'border-2 border-danger px-[15px]',
      disabled: 'border border-line bg-surface px-4',
    },
    multiline: {
      true: 'min-h-[96px] items-start py-3',
      false: 'h-12',
    },
  },
  defaultVariants: { state: 'default', multiline: false },
});

const inputTextVariants = cva('flex-1 p-0 font-sans text-md', {
  variants: {
    disabled: { true: 'text-grey', false: 'text-ink' },
  },
  defaultVariants: { disabled: false },
});

type InputState = 'default' | 'focused' | 'error' | 'disabled';

const resolveInputState = (opts: {
  focused: boolean;
  invalid: boolean;
  disabled: boolean;
}): InputState => {
  if (opts.disabled) return 'disabled';
  if (opts.invalid) return 'error';
  if (opts.focused) return 'focused';
  return 'default';
};

/** Tracks focus while still calling the caller's own onFocus/onBlur. */
function useFocusState(
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void,
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void,
) {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    handlers: {
      onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => {
        setFocused(true);
        onFocus?.(event);
      },
      onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => {
        setFocused(false);
        onBlur?.(event);
      },
    },
  };
}

type TextInputProps = RNTextInputProps & {
  /** Error styling without a Field; inside a Field the error comes from it. */
  invalid?: boolean;
  containerClassName?: string;
  /** Muted text after the value, e.g. "%". */
  suffix?: string;
};

function TextInput({
  invalid,
  suffix,
  editable = true,
  multiline = false,
  className,
  containerClassName,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const field = useField();
  const { focused, handlers } = useFocusState(onFocus, onBlur);
  const disabled = !editable;
  const state = resolveInputState({ focused, invalid: invalid ?? field.invalid, disabled });

  return (
    <View className={cn(inputContainerVariants({ state, multiline }), containerClassName)}>
      <RNTextInput
        accessibilityLabel={field.label}
        accessibilityHint={field.description}
        aria-required={field.required}
        aria-invalid={state === 'error'}
        editable={editable}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={toneColor('muted')}
        selectionColor={toneColor('accent')}
        cursorColor={toneColor('accent')}
        className={cn(inputTextVariants({ disabled }), className)}
        {...handlers}
        {...rest}
      />
      {suffix === undefined ? null : (
        <Text importantForAccessibility="no" className="ml-1 font-sans text-md text-grey">
          {suffix}
        </Text>
      )}
    </View>
  );
}

export {
  inputContainerVariants,
  inputTextVariants,
  type InputState,
  resolveInputState,
  useFocusState,
  type TextInputProps,
  TextInput,
};
