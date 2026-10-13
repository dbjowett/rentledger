import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { Children } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';
import type { Tone } from '@/theme/tokens';

import { IconTile } from '../IconTile/IconTile';
import { Text, type TextProps } from '../Text/Text';

const emptyStateVariants = cva('w-full items-center justify-center gap-6 rounded-card p-6', {
  variants: {
    variant: {
      plain: '',
      outline: 'border border-dashed border-outline',
    },
  },
  defaultVariants: { variant: 'plain' },
});

const emptyStateHeaderVariants = cva('w-full max-w-sm items-center gap-2');

const emptyStateMediaVariants = cva('mb-2 items-center justify-center');

const emptyStateTitleTextVariants = cva('text-center font-semibold text-xl text-ink');

const emptyStateDescriptionTextVariants = cva(
  'text-center font-sans text-base leading-[22px] text-grey',
);

const emptyStateContentVariants = cva('w-full max-w-sm items-center gap-4');

type EmptyStateProps = ViewProps & VariantProps<typeof emptyStateVariants>;

function EmptyStateRoot({ variant, className, ...rest }: EmptyStateProps) {
  return <View className={cn(emptyStateVariants({ variant }), className)} {...rest} />;
}

function EmptyStateHeader({ className, ...rest }: ViewProps) {
  return <View className={cn(emptyStateHeaderVariants(), className)} {...rest} />;
}

type EmptyStateMediaProps = ViewProps &
  (
    | { variant?: 'default'; icon?: never; tone?: never }
    | { variant: 'icon'; icon: LucideIcon; tone?: Tone }
  );

function EmptyStateMedia({
  variant = 'default',
  icon,
  tone = 'accent',
  className,
  children,
  ...rest
}: EmptyStateMediaProps) {
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      className={cn(emptyStateMediaVariants(), className)}
      {...rest}
    >
      {variant === 'icon' && icon !== undefined ? <IconTile tone={tone} icon={icon} /> : children}
    </View>
  );
}

function EmptyStateTitle({ className, ...rest }: TextProps) {
  return (
    <Text
      accessibilityRole="header"
      className={cn(emptyStateTitleTextVariants(), className)}
      {...rest}
    />
  );
}

function EmptyStateDescription({ className, ...rest }: TextProps) {
  return <Text className={cn(emptyStateDescriptionTextVariants(), className)} {...rest} />;
}

function EmptyStateContent({ className, children, ...rest }: ViewProps) {
  // Wrappers centre Buttons, which are self-start so they don't stretch in columns.
  return (
    <View className={cn(emptyStateContentVariants(), className)} {...rest}>
      {Children.map(children, (child) => (
        <View className="w-full flex-row justify-center">{child}</View>
      ))}
    </View>
  );
}

const EmptyState = Object.assign(EmptyStateRoot, {
  Header: EmptyStateHeader,
  Media: EmptyStateMedia,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Content: EmptyStateContent,
});

export {
  emptyStateVariants,
  emptyStateHeaderVariants,
  emptyStateMediaVariants,
  emptyStateTitleTextVariants,
  emptyStateDescriptionTextVariants,
  emptyStateContentVariants,
  type EmptyStateProps,
  type EmptyStateMediaProps,
  EmptyState,
};
