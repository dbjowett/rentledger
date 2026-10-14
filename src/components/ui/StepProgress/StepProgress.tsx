import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const stepProgressVariants = cva('flex-row items-center gap-3');
const stepProgressTrackVariants = cva('h-1 flex-1 overflow-hidden rounded-full bg-line');
const stepProgressFillVariants = cva('h-full rounded-full bg-accent');

const FILL_DURATION_MS = 280;

type StepProgressProps = ViewProps & {
  /** One name per step, read by screen readers, e.g. ["Property", "Units", "Review"]. */
  steps: readonly string[];
  /** Zero-based index of the current step. */
  current: number;
  /** Shows "2 of 3" after the bars. */
  showCount?: boolean;
};

/** One bar: full when the step is done or current, empty when upcoming. Animates on change. */
function StepBar({ filled }: { filled: boolean }) {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, {
      duration: FILL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View className={stepProgressTrackVariants()}>
      <Animated.View style={fillStyle} className={stepProgressFillVariants()} />
    </View>
  );
}

/** Progress through a multi-step flow: one bar per step, filled up to the current one. */
function StepProgress({
  steps,
  current,
  showCount = false,
  className,
  ...rest
}: StepProgressProps) {
  const total = steps.length;
  const position = Math.min(current + 1, total);
  const stepName = steps[current] ?? '';

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: total,
        now: position,
        text: `Step ${position} of ${total}, ${stepName}`,
      }}
      className={cn(stepProgressVariants(), className)}
      {...rest}
    >
      <View className="flex-1 flex-row gap-2">
        {steps.map((step, index) => (
          <StepBar key={step} filled={index <= current} />
        ))}
      </View>
      {showCount ? (
        <Text size="sm" tone="grey">
          {`${position} of ${total}`}
        </Text>
      ) : null}
    </View>
  );
}

export {
  stepProgressFillVariants,
  stepProgressTrackVariants,
  stepProgressVariants,
  type StepProgressProps,
  StepProgress,
};
