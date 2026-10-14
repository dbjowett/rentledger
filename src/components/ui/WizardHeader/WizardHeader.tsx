import { View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

import { Button } from '../Button/Button';
import { StepProgress } from '../StepProgress/StepProgress';
import { Text } from '../Text/Text';

const wizardHeaderVariants = cva('bg-card px-screen pb-3');
const wizardHeaderTitleTextVariants = cva('text-center font-semibold text-lg text-ink');

type WizardHeaderProps = ViewProps & {
  title: string;
  /** Top-left action, e.g. "Cancel" on the first step and "Back" after it. */
  leftLabel: string;
  onLeftPress: () => void;
  steps: readonly string[];
  /** Zero-based index of the current step. */
  current: number;
  /** Ignores the left action, e.g. while saving. */
  disabled?: boolean;
};

/** Header for a multi-step flow shown without the navigation header: action, title, "n of N", progress bars. */
function WizardHeader({
  title,
  leftLabel,
  onLeftPress,
  steps,
  current,
  disabled = false,
  className,
  style,
  ...rest
}: WizardHeaderProps) {
  const insets = useSafeAreaInsets();
  const position = Math.min(current + 1, steps.length);

  return (
    <View
      style={[{ paddingTop: insets.top + 8 }, style]}
      className={cn(wizardHeaderVariants(), className)}
      {...rest}
    >
      <View className="min-h-11 flex-row items-center">
        <View className="flex-1 flex-row justify-start">
          <Button
            variant="link"
            size="sm"
            label={leftLabel}
            disabled={disabled}
            onPress={onLeftPress}
          />
        </View>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className={wizardHeaderTitleTextVariants()}
        >
          {title}
        </Text>
        <View className="flex-1 flex-row justify-end">
          <Text size="sm" tone="grey" importantForAccessibility="no">
            {`${position} of ${steps.length}`}
          </Text>
        </View>
      </View>
      <StepProgress steps={steps} current={current} className="mt-2" />
    </View>
  );
}

export {
  wizardHeaderTitleTextVariants,
  wizardHeaderVariants,
  type WizardHeaderProps,
  WizardHeader,
};
