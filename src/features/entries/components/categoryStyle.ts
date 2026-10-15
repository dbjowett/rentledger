import {
  ArrowDownLeft,
  Banknote,
  BriefcaseBusiness,
  Coins,
  Landmark,
  Megaphone,
  Percent,
  Receipt,
  Scale,
  ShieldCheck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import type { EntryKind } from '@/shared/schemas';
import type { Tone } from '@/theme/tokens';

type CategoryStyle = { icon: LucideIcon; tone: Tone };

/** Icon and colour per system category, so a list can be scanned at a glance. */
const CATEGORY_STYLES: Readonly<Record<string, CategoryStyle>> = {
  rent: { icon: ArrowDownLeft, tone: 'success' },
  other_income: { icon: Coins, tone: 'success' },
  repairs: { icon: Wrench, tone: 'warning' },
  utilities: { icon: Zap, tone: 'slate' },
  insurance: { icon: ShieldCheck, tone: 'accent' },
  property_taxes: { icon: Landmark, tone: 'violet' },
  mortgage_interest: { icon: Percent, tone: 'accent' },
  mortgage_principal: { icon: Banknote, tone: 'accent' },
  advertising: { icon: Megaphone, tone: 'violet' },
  management_fees: { icon: BriefcaseBusiness, tone: 'slate' },
  professional_fees: { icon: Scale, tone: 'slate' },
  other_expenses: { icon: Receipt, tone: 'slate' },
};

const FALLBACK_STYLES: Record<EntryKind, CategoryStyle> = {
  income: { icon: Coins, tone: 'success' },
  expense: { icon: Receipt, tone: 'slate' },
};

function categoryStyle(key: string | null, kind: EntryKind): CategoryStyle {
  return (key === null ? undefined : CATEGORY_STYLES[key]) ?? FALLBACK_STYLES[kind];
}

export { type CategoryStyle, categoryStyle };
