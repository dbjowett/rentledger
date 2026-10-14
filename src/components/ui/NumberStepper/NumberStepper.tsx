import { useCallback, useEffect, useRef } from 'react';
import { View, type AccessibilityActionEvent, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import { clamp } from 'es-toolkit';
import { Minus, Plus } from 'lucide-react-native';

import { cn } from '@/lib/cn';

import { IconButton } from '../IconButton/IconButton';
import { Text } from '../Text/Text';

const numberStepperVariants = cva('flex-row items-center', {
  variants: {
    layout: {
      inline: 'gap-3 self-start',
      card: 'min-h-[72px] gap-3 rounded-tile bg-surface px-4 py-3',
    },
  },
  defaultVariants: { layout: 'inline' },
});
const numberStepperTextVariants = cva('min-w-10 text-center font-mono text-lg text-ink');
const numberStepperTitleTextVariants = cva('font-semibold text-lg text-ink');

const REPEAT_INTERVAL_MS = 120;

type NumberStepperProps = ViewProps & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Used for the screen reader and the decrement/increment button labels. */
  accessibilityLabel: string;
  formatValue?: (value: number) => string;
  /**
   * Shows the value as a title in a full-width card, e.g. "4 units", with the buttons on the
   * right. Without it, the value sits between the buttons.
   */
  title?: string;
  /** Muted line under the title, e.g. "A house or condo is 1". Card layout only. */
  description?: string;
};

/** Repeats `action` while a button is held, after the long-press delay. */
function useRepeatPress(action: () => void) {
  const actionRef = useRef(action);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  const stop = useCallback(() => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(() => actionRef.current(), REPEAT_INTERVAL_MS);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { onLongPress: start, onPressOut: stop };
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  accessibilityLabel,
  formatValue = String,
  title,
  description,
  className,
  ...rest
}: NumberStepperProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;
  const decrement = useCallback(
    () => onChange(clamp(value - step, min, max)),
    [onChange, value, step, min, max],
  );
  const increment = useCallback(
    () => onChange(clamp(value + step, min, max)),
    [onChange, value, step, min, max],
  );
  const decrementRepeat = useRepeatPress(decrement);
  const incrementRepeat = useRepeatPress(increment);
  const label = formatValue(value);
  const card = title !== undefined;

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment' && canIncrement) increment();
    if (event.nativeEvent.actionName === 'decrement' && canDecrement) decrement();
  };

  const minusButton = (
    <IconButton
      variant="outline"
      size="sm"
      icon={Minus}
      accessibilityLabel={`Decrease ${accessibilityLabel}`}
      disabled={!canDecrement}
      onPress={decrement}
      {...decrementRepeat}
    />
  );
  const plusButton = (
    <IconButton
      variant="outline"
      size="sm"
      icon={Plus}
      accessibilityLabel={`Increase ${accessibilityLabel}`}
      disabled={!canIncrement}
      onPress={increment}
      {...incrementRepeat}
    />
  );

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: card ? title : label }}
      accessibilityHint={description}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
      className={cn(numberStepperVariants({ layout: card ? 'card' : 'inline' }), className)}
      {...rest}
    >
      {card ? (
        <>
          <View className="flex-1">
            <Text className={numberStepperTitleTextVariants()}>{title}</Text>
            {description === undefined ? null : (
              <Text size="sm" tone="grey">
                {description}
              </Text>
            )}
          </View>
          {minusButton}
          {plusButton}
        </>
      ) : (
        <>
          {minusButton}
          <Text className={numberStepperTextVariants()}>{label}</Text>
          {plusButton}
        </>
      )}
    </View>
  );
}

export {
  numberStepperTextVariants,
  numberStepperTitleTextVariants,
  numberStepperVariants,
  type NumberStepperProps,
  NumberStepper,
};
