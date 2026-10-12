import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

export const splitBarVariants = cva('w-full flex-row gap-0.5', {
  variants: {
    size: { sm: 'h-2', md: 'h-3' },
  },
  defaultVariants: { size: 'md' },
});

export const splitBarSegmentVariants = cva('h-full rounded-full', {
  variants: {
    tone: {
      accent: 'bg-accent',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      slate: 'bg-slate',
      violet: 'bg-violet',
      muted: 'bg-outline',
    },
  },
  defaultVariants: { tone: 'accent' },
});

export const splitBarLegendTextVariants = cva('font-sans text-sm text-grey');

export type SplitBarTone = NonNullable<VariantProps<typeof splitBarSegmentVariants>['tone']>;
export type SplitBarSize = NonNullable<VariantProps<typeof splitBarVariants>['size']>;

export type SplitBarSegment = {
  key: string;
  value: number;
  tone: SplitBarTone;
  label?: string;
};

export type SplitBarProps = ViewProps & {
  segments: SplitBarSegment[];
  size?: SplitBarSize;
  legend?: boolean;
};

const percentOf = (value: number, total: number) => Math.round((value / total) * 100);

export function SplitBar({
  segments,
  size = 'md',
  legend = false,
  className,
  ...rest
}: SplitBarProps) {
  const visible = segments.filter((segment) => segment.value > 0);
  const total = visible.reduce((sum, segment) => sum + segment.value, 0);
  const summary = visible
    .map((segment) => `${segment.label ?? segment.key} ${percentOf(segment.value, total)}%`)
    .join(', ');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      className={cn('gap-2', className)}
      {...rest}
    >
      <View className={splitBarVariants({ size })}>
        {total > 0 ? (
          visible.map(({ key, value, tone }) => (
            <View
              key={key}
              style={{ flexGrow: value, flexBasis: 0 }}
              className={splitBarSegmentVariants({ tone })}
            />
          ))
        ) : (
          <View className="h-full flex-1 rounded-full bg-line" />
        )}
      </View>
      {legend && total > 0 && (
        <View className="flex-row flex-wrap gap-x-4 gap-y-1">
          {visible.map((segment) => (
            <View key={segment.key} className="flex-row items-center gap-1.5">
              <View className={cn(splitBarSegmentVariants({ tone: segment.tone }), 'h-2 w-2')} />
              <Text className={splitBarLegendTextVariants()}>
                {`${segment.label ?? segment.key} · ${percentOf(segment.value, total)}%`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
