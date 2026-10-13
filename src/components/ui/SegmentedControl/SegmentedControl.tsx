import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import type { VariantProps } from 'class-variance-authority';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';
import {
  segmentedControlVariants,
  segmentIndicatorVariants,
  segmentVariants,
  segmentTextVariants,
} from './variants';

const TRACK_PADDING = 2;

type SegmentedControlSize = NonNullable<VariantProps<typeof segmentedControlVariants>['size']>;
type SegmentedControlRounded = NonNullable<
  VariantProps<typeof segmentedControlVariants>['rounded']
>;

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = ViewProps & {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  rounded?: SegmentedControlRounded;
};

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  onLayout,
  ...rest
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;

  const position = useSharedValue(selectedIndex);

  useEffect(() => {
    position.value = withTiming(selectedIndex, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedIndex, position]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * segmentWidth }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    onLayout?.(event);
  };

  return (
    <View
      accessibilityRole="radiogroup"
      className={cn(segmentedControlVariants({ size }), className)}
      onLayout={handleLayout}
      {...rest}
    >
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: TRACK_PADDING,
              bottom: TRACK_PADDING,
              left: TRACK_PADDING,
              width: segmentWidth,
            },
            indicatorStyle,
          ]}
        >
          <View className={segmentIndicatorVariants()} />
        </Animated.View>
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            hitSlop={size === 'sm' ? { top: 6, bottom: 6 } : 0}
            onPress={() => onChange(option.value)}
            className={segmentVariants()}
          >
            <Text numberOfLines={1} className={segmentTextVariants({ size, selected })}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export {
  type SegmentedControlSize,
  type SegmentedControlRounded,
  type SegmentOption,
  type SegmentedControlProps,
  SegmentedControl,
};
