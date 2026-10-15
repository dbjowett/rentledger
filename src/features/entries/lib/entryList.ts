import { formatDateMedium, formatMonthYear, toMonthStart, type MonthStart } from '@/shared/dates';
import type { EntryListItem, EntryPlacement } from '@/shared/types';

import { categoryChipLabel } from './categories';

/** One month of entries, newest month first. */
type EntryMonth = {
  month: MonthStart;
  title: string;
  incomeCents: number;
  expenseCents: number;
  data: EntryListItem[];
};

/**
 * Groups entries (already newest first) into months, with what came in and went out.
 * @example groupEntriesByMonth(entries)[0].title // 'October 2026'
 */
function groupEntriesByMonth(entries: readonly EntryListItem[]): EntryMonth[] {
  const months: EntryMonth[] = [];
  for (const entry of entries) {
    const month = toMonthStart(entry.date);
    let group = months.at(-1);
    if (group?.month !== month) {
      group = { month, title: formatMonthYear(month), incomeCents: 0, expenseCents: 0, data: [] };
      months.push(group);
    }
    group.data.push(entry);
    if (entry.kind === 'income') group.incomeCents += entry.amountCents;
    else group.expenseCents += entry.amountCents;
  }
  return months;
}

/**
 * Where the money went, in a few words.
 * @example placementLabel({ type: 'split', unitLabels: ['Unit 1', 'Unit 2'] }) // 'Unit 1 + Unit 2'
 */
function placementLabel(placement: EntryPlacement): string | null {
  if (placement.type === 'property') return null;
  if (placement.type === 'building') return 'Whole building';
  if (placement.type === 'unit') return placement.unitLabel;
  if (placement.unitLabels.length > 2) return `Split · ${placement.unitLabels.length} units`;
  return placement.unitLabels.join(' + ');
}

/**
 * The grey line under an entry: property, where it went, and the date.
 * @example entryMeta(entry) // 'Cedar Row · Unit 1 · Oct 8, 2026'
 */
function entryMeta(entry: EntryListItem): string {
  return [entry.property.name, placementLabel(entry.placement), formatDateMedium(entry.date)]
    .filter((part) => part !== null)
    .join(' · ');
}

/** The entry's title: its category, shortened like the chips. */
function entryTitle(entry: EntryListItem): string {
  return categoryChipLabel(entry.category);
}

export { type EntryMonth, entryMeta, entryTitle, groupEntriesByMonth, placementLabel };
