import { View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import { CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { Text } from '../Text/Text';

const bannerVariants = cva('flex-row items-start gap-3 rounded-tile px-4 py-3', {
  variants: {
    tone: {
      danger: 'bg-danger-tint',
      warning: 'bg-warning-tint',
      info: 'bg-accent-tint',
    },
  },
  defaultVariants: { tone: 'danger' },
});

const bannerTextVariants = cva('flex-1 font-sans text-base', {
  variants: {
    tone: { danger: 'text-danger', warning: 'text-warning', info: 'text-accent' },
  },
  defaultVariants: { tone: 'danger' },
});

type BannerTone = 'danger' | 'warning' | 'info';

const toneIcon: Record<BannerTone, { icon: LucideIcon; color: 'danger' | 'warning' | 'accent' }> = {
  danger: { icon: CircleAlert, color: 'danger' },
  warning: { icon: TriangleAlert, color: 'warning' },
  info: { icon: Info, color: 'accent' },
};

type BannerProps = ViewProps & {
  tone?: BannerTone;
  message: string;
};

/** An inline message about the whole form or screen, e.g. a save error. Announced when shown. */
function Banner({ tone = 'danger', message, className, ...rest }: BannerProps) {
  const { icon: Icon, color } = toneIcon[tone];
  return (
    <View
      accessibilityRole={tone === 'info' ? 'text' : 'alert'}
      accessibilityLiveRegion="polite"
      className={cn(bannerVariants({ tone }), className)}
      {...rest}
    >
      <Icon size={18} color={toneColor(color)} strokeWidth={2} style={{ marginTop: 1 }} />
      <Text className={bannerTextVariants({ tone })}>{message}</Text>
    </View>
  );
}

export { bannerTextVariants, bannerVariants, type BannerProps, type BannerTone, Banner };
