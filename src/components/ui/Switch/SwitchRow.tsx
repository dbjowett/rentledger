import { View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';
import { Switch } from './Switch';

const switchRowVariants = cva('min-h-14 flex-row items-center gap-4 py-2');

type SwitchRowProps = ViewProps & {
  label: string;
  /** One muted line explaining what the switch does. */
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** A labelled setting: label and hint on the left, Switch on the right. */
function SwitchRow({
  label,
  hint,
  value,
  onValueChange,
  disabled,
  className,
  ...rest
}: SwitchRowProps) {
  return (
    <View className={cn(switchRowVariants(), className)} {...rest}>
      <View className="flex-1 gap-0.5">
        <Text size="md" importantForAccessibility="no">
          {label}
        </Text>
        {hint === undefined ? null : (
          <Text size="sm" tone="grey" importantForAccessibility="no">
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={hint}
      />
    </View>
  );
}

export { switchRowVariants, type SwitchRowProps, SwitchRow };
