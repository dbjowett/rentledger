import type { EntryListItem } from '@/shared/types';

import { entryMeta, entryTitle, groupEntriesByMonth, placementLabel } from './entryList';

function entry(overrides: Partial<EntryListItem>): EntryListItem {
  return {
    id: 'e',
    kind: 'expense',
    amountCents: 10_000,
    date: '2026-10-08',
    note: null,
    isCapital: false,
    isRecurring: false,
    hasReceipt: false,
    property: { id: 'p', name: 'Cedar Row' },
    category: { key: 'repairs', name: 'Repairs and maintenance' },
    placement: { type: 'building' },
    ...overrides,
  };
}

describe('groupEntriesByMonth', () => {
  it('groups newest-first entries by month with in and out totals', () => {
    const months = groupEntriesByMonth([
      entry({ id: 'a', date: '2026-10-31', kind: 'income', amountCents: 145_000 }),
      entry({ id: 'b', date: '2026-10-08', amountCents: 10_000 }),
      entry({ id: 'c', date: '2026-10-02', amountCents: 2400 }),
      entry({ id: 'd', date: '2026-09-15', amountCents: 5000 }),
    ]);
    expect(months.map((month) => month.title)).toEqual(['October 2026', 'September 2026']);
    expect(months[0]).toMatchObject({ incomeCents: 145_000, expenseCents: 12_400 });
    expect(months[0]?.data.map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(months[1]).toMatchObject({ incomeCents: 0, expenseCents: 5000 });
  });

  it('returns nothing for no entries', () => {
    expect(groupEntriesByMonth([])).toEqual([]);
  });
});

describe('labels', () => {
  it('describes where the money went', () => {
    expect(placementLabel({ type: 'property' })).toBeNull();
    expect(placementLabel({ type: 'building' })).toBe('Whole building');
    expect(placementLabel({ type: 'unit', unitLabel: 'Unit 2' })).toBe('Unit 2');
    expect(placementLabel({ type: 'split', unitLabels: ['Unit 1', 'Unit 2'] })).toBe(
      'Unit 1 + Unit 2',
    );
    expect(placementLabel({ type: 'split', unitLabels: ['A', 'B', 'C'] })).toBe('Split · 3 units');
  });

  it('builds the meta line and title', () => {
    expect(entryMeta(entry({ placement: { type: 'unit', unitLabel: 'Unit 1' } }))).toBe(
      'Cedar Row · Unit 1 · Oct 8, 2026',
    );
    expect(entryMeta(entry({ placement: { type: 'property' } }))).toBe('Cedar Row · Oct 8, 2026');
    expect(entryTitle(entry({}))).toBe('Repairs');
  });
});
