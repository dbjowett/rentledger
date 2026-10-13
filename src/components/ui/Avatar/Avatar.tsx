import { useState } from 'react';
import { Image, View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { UserRound } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { Text } from '../Text/Text';

const avatarVariants = cva(
  'items-center justify-center overflow-hidden rounded-full bg-accent-tint',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-14 w-14',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const avatarTextVariants = cva('font-semibold text-accent', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl',
    },
  },
  defaultVariants: { size: 'md' },
});

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

type AvatarFallback = 'initials' | 'icon';

const iconSize: Record<AvatarSize, number> = { sm: 18, md: 22, lg: 30 };

type AvatarProps = ViewProps & {
  /** Shown when there is no image or it fails to load. */
  fallback?: AvatarFallback;
  name: string | null;
  imageUrl?: string | null;
  size?: AvatarSize;
};

function initialsOf(name: string | null): string {
  if (name === null) return '?';
  const parts = name.trim().split(/\s+/);
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)] : [parts[0]];
  return letters
    .map((part) => part?.charAt(0) ?? '')
    .join('')
    .toUpperCase();
}

function AvatarFallbackContent({
  fallback,
  name,
  size,
}: {
  fallback: AvatarFallback;
  name: string | null;
  size: AvatarSize;
}) {
  if (fallback === 'icon') {
    return <UserRound size={iconSize[size]} color={toneColor('accent')} strokeWidth={2} />;
  }
  return <Text className={avatarTextVariants({ size })}>{initialsOf(name)}</Text>;
}

function Avatar({
  name,
  imageUrl = null,
  size = 'md',
  fallback = 'initials',
  className,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl !== null && !failed;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name ?? 'User'}
      className={cn(avatarVariants({ size }), className)}
      {...rest}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          onError={() => setFailed(true)}
          className="h-full w-full"
        />
      ) : (
        <AvatarFallbackContent fallback={fallback} name={name} size={size} />
      )}
    </View>
  );
}

export {
  type AvatarFallback,
  type AvatarProps,
  type AvatarSize,
  Avatar,
  avatarTextVariants,
  avatarVariants,
};
