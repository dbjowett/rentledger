import { cva } from 'class-variance-authority';
import { useEffect } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

const THUMB_TRAVEL = 20;

const switchTrackVariants = cva('h-7 w-12 justify-center rounded-full p-0.5', {
  variants: {
    value: { true: 'bg-accent', false: 'bg-outline' },
    disabled: { true: 'opacity-50', false: '' },
  },
  defaultVariants: { value: false, disabled: false },
});

const switchThumbVariants = cva('h-6 w-6 rounded-full bg-card shadow-sm');

type SwitchProps = Omit<PressableProps, 'children' | 'disabled' | 'onPress'> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

function Switch({ value, onValueChange, disabled = false, className, ...rest }: SwitchProps) {
  const offset = useSharedValue(value ? THUMB_TRAVEL : 0);

  useEffect(() => {
    offset.value = withTiming(value ? THUMB_TRAVEL : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      className={cn(switchTrackVariants({ value, disabled }), className)}
      {...rest}
    >
      <Animated.View style={thumbStyle}>
        <View className={switchThumbVariants()} />
      </Animated.View>
    </Pressable>
  );
}

export { switchTrackVariants, switchThumbVariants, type SwitchProps, Switch };
