import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const cardVariants = cva('overflow-hidden rounded-card', {
  variants: {
    variant: {
      elevated: 'border border-line bg-card',
      muted: 'bg-surface',
      accent: 'border-2 border-accent bg-accent-tint',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
    pressable: { true: '', false: '' },
  },
  compoundVariants: [
    { pressable: true, variant: 'elevated', className: 'active:bg-surface' },
    { pressable: true, variant: 'muted', className: 'active:bg-line' },
    { pressable: true, variant: 'accent', className: 'active:opacity-80' },
  ],
  defaultVariants: { variant: 'elevated', padding: 'md', pressable: false },
});

type CardVariantProps = Omit<VariantProps<typeof cardVariants>, 'pressable'>;

type CardProps = Omit<PressableProps, 'children'> &
  CardVariantProps & {
    children?: ReactNode;
  };

function CardRoot({ variant, padding, onPress, className, children, ...rest }: CardProps) {
  const pressable = onPress !== undefined;

  // Always a Pressable so props stay one type; without onPress it's disabled and acts as a View.
  return (
    <Pressable
      accessibilityRole={pressable ? 'button' : undefined}
      disabled={!pressable}
      onPress={onPress}
      className={cn(cardVariants({ variant, padding, pressable }), className)}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

const cardHeaderVariants = cva('mb-3 min-h-[28px] flex-row items-center gap-2');
const cardHeaderTextVariants = cva('shrink font-semibold text-xl text-ink');

type CardHeaderProps = ViewProps & {
  title: string;
  /** Sits right after the title, e.g. a CountBadge or Tag. */
  accessory?: ReactNode;
  /** Right-aligned, e.g. a link Button or IconButton. */
  action?: ReactNode;
};

function CardHeader({ title, accessory, action, className, ...rest }: CardHeaderProps) {
  return (
    <View className={cn(cardHeaderVariants(), className)} {...rest}>
      <Text accessibilityRole="header" numberOfLines={1} className={cardHeaderTextVariants()}>
        {title}
      </Text>
      {/* Wrapper centres badges/tags, which are self-start so they don't stretch in columns. */}
      {accessory != null && <View>{accessory}</View>}
      {action != null && <View className="ml-auto">{action}</View>}
    </View>
  );
}

function CardBody({ className, ...rest }: ViewProps) {
  return <View className={cn('gap-3', className)} {...rest} />;
}

function CardFooter({ className, ...rest }: ViewProps) {
  return <View className={cn('mt-4 flex-row items-center gap-3', className)} {...rest} />;
}

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export {
  cardVariants,
  type CardProps,
  cardHeaderVariants,
  cardHeaderTextVariants,
  type CardHeaderProps,
  Card,
};
