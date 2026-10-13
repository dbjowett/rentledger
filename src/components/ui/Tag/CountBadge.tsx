import { cva } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const countBadgeVariants = cva(
  'h-6 min-w-6 items-center justify-center self-start rounded-full bg-ink px-1.5',
);

const countBadgeTextVariants = cva('font-semibold text-sm text-white');

type CountBadgeProps = ViewProps & {
  count: number;
  /** Counts above this show as "{max}+". */
  max?: number;
};

function CountBadge({ count, max = 99, className, ...rest }: CountBadgeProps) {
  const label = count > max ? `${max}+` : String(count);

  return (
    <View
      accessible
      accessibilityLabel={`${count} items`}
      className={cn(countBadgeVariants(), className)}
      {...rest}
    >
      <Text className={countBadgeTextVariants()}>{label}</Text>
    </View>
  );
}

export { countBadgeVariants, countBadgeTextVariants, type CountBadgeProps, CountBadge };
