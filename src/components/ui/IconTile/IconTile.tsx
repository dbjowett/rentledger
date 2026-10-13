import { cva } from 'class-variance-authority';
import {
  ArrowDownLeft,
  Check,
  FileText,
  Paperclip,
  Percent,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor, type Tone } from '@/theme/tokens';

const iconTileVariants = cva('items-center justify-center rounded-tile', {
  variants: {
    tone: {
      accent: 'bg-accent-tint',
      success: 'bg-success-tint',
      warning: 'bg-warning-tint',
      danger: 'bg-danger-tint',
      slate: 'bg-slate-tint',
      violet: 'bg-violet-tint',
    },
    size: {
      36: 'h-9 w-9',
      44: 'h-11 w-11',
    },
  },
  defaultVariants: { tone: 'accent', size: 44 },
});

const iconTileKinds = {
  rent: { tone: 'success', icon: ArrowDownLeft },
  bill: { tone: 'slate', icon: FileText },
  mortgage: { tone: 'accent', icon: Percent },
  receipt: { tone: 'warning', icon: Receipt },
  match: { tone: 'violet', icon: Paperclip },
  done: { tone: 'success', icon: Check },
} as const satisfies Record<string, { tone: Tone; icon: LucideIcon }>;

type IconTileKind = keyof typeof iconTileKinds;
type IconTileSize = 36 | 44;

const iconSize: Record<IconTileSize, number> = { 36: 18, 44: 22 };

type IconTileProps = ViewProps & {
  size?: IconTileSize;
} & (
    | { kind: IconTileKind; tone?: never; icon?: never }
    | { kind?: never; tone: Tone; icon: LucideIcon }
  );

function IconTile({ kind, tone, icon, size = 44, className, ...rest }: IconTileProps) {
  const preset = kind ? iconTileKinds[kind] : undefined;
  const resolvedTone: Tone = preset?.tone ?? tone ?? 'accent';
  const Icon: LucideIcon = preset?.icon ?? icon ?? Check;

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      className={cn(iconTileVariants({ tone: resolvedTone, size }), className)}
      {...rest}
    >
      <Icon size={iconSize[size]} color={toneColor(resolvedTone)} strokeWidth={2} />
    </View>
  );
}

export {
  iconTileVariants,
  iconTileKinds,
  type IconTileKind,
  type IconTileSize,
  type IconTileProps,
  IconTile,
};
