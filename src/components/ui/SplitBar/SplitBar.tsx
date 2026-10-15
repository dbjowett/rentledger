import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { sumBy } from 'es-toolkit';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const splitBarVariants = cva('w-full flex-row gap-0.5', {
  variants: {
    size: { sm: 'h-2', md: 'h-3' },
  },
  defaultVariants: { size: 'md' },
});

const splitBarSegmentVariants = cva('h-full rounded-full', {
  variants: {
    tone: {
      accent: 'bg-accent',
      accentSoft: 'bg-accent/40',
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

const splitBarLegendTextVariants = cva('font-sans text-sm text-grey');

type SplitBarTone = NonNullable<VariantProps<typeof splitBarSegmentVariants>['tone']>;
type SplitBarSize = NonNullable<VariantProps<typeof splitBarVariants>['size']>;

type SplitBarSegment = {
  key: string;
  value: number;
  tone: SplitBarTone;
  label?: string;
};

type SplitBarProps = ViewProps & {
  segments: SplitBarSegment[];
  size?: SplitBarSize;
  legend?: boolean;
};

const percentOf = (value: number, total: number) => Math.round((value / total) * 100);

function SplitBar({ segments, size = 'md', legend = false, className, ...rest }: SplitBarProps) {
  const visible = segments.filter((segment) => segment.value > 0);
  const total = sumBy(visible, (segment) => segment.value);
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

export {
  splitBarVariants,
  splitBarSegmentVariants,
  splitBarLegendTextVariants,
  type SplitBarTone,
  type SplitBarSize,
  type SplitBarSegment,
  type SplitBarProps,
  SplitBar,
};
