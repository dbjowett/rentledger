import { cva } from 'class-variance-authority';
import { Minus, Plus } from 'lucide-react-native';
import { View, type AccessibilityActionEvent, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { IconButton } from '../IconButton/IconButton';
import { Text } from '../Text/Text';

const stepperVariants = cva('flex-row items-center gap-3 self-start');
const stepperTextVariants = cva('min-w-10 text-center font-mono text-lg text-ink');

type StepperProps = ViewProps & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Used for the screen reader and the decrement/increment button labels. */
  accessibilityLabel: string;
  formatValue?: (value: number) => string;
};

function Stepper({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  accessibilityLabel,
  formatValue = String,
  className,
  ...rest
}: StepperProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const label = formatValue(value);

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment' && canIncrement) increment();
    if (event.nativeEvent.actionName === 'decrement' && canDecrement) decrement();
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: label }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAccessibilityAction}
      className={cn(stepperVariants(), className)}
      {...rest}
    >
      <IconButton
        variant="outline"
        size="sm"
        icon={Minus}
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        disabled={!canDecrement}
        onPress={decrement}
      />
      <Text className={stepperTextVariants()}>{label}</Text>
      <IconButton
        variant="outline"
        size="sm"
        icon={Plus}
        accessibilityLabel={`Increase ${accessibilityLabel}`}
        disabled={!canIncrement}
        onPress={increment}
      />
    </View>
  );
}

export { stepperVariants, stepperTextVariants, type StepperProps, Stepper };
