import { categoryChipLabel, orderCategories, taxLineLabel } from './categories';

function category(name: string, key: string | null, sortOrder: number, useCount = 0) {
  return { name, key, sortOrder, useCount };
}

const defaults = [
  category('Repairs and maintenance', 'repairs', 1),
  category('Utilities', 'utilities', 2),
  category('Insurance', 'insurance', 3),
  category('Property taxes', 'property_taxes', 4),
  category('Mortgage interest', 'mortgage_interest', 5),
  category('Other expenses', 'other_expenses', 6),
  category('Advertising', 'advertising', 7),
  category('Professional fees', 'professional_fees', 9),
];

describe('orderCategories', () => {
  it('shows the defaults first when there is no history', () => {
    const { top, rest } = orderCategories(defaults.toReversed());
    expect(top.map((c) => c.key)).toEqual([
      'repairs',
      'utilities',
      'insurance',
      'property_taxes',
      'mortgage_interest',
      'other_expenses',
    ]);
    expect(rest.map((c) => c.key)).toEqual(['advertising', 'professional_fees']);
  });

  it('moves the most used to the front', () => {
    const useCounts: Record<string, number> = { advertising: 5, insurance: 2 };
    const used = defaults.map((c) => ({ ...c, useCount: useCounts[c.key ?? ''] ?? 0 }));
    expect(
      orderCategories(used)
        .top.slice(0, 3)
        .map((c) => c.key),
    ).toEqual(['advertising', 'insurance', 'repairs']);
  });

  it('puts the user’s own categories after the defaults, by name', () => {
    const own = [category('Snow removal', null, 0), category('Landscaping', null, 0)];
    const { rest } = orderCategories([...defaults, ...own]);
    expect(rest.map((c) => c.name).slice(-2)).toEqual(['Landscaping', 'Snow removal']);
  });
});

describe('taxLineLabel', () => {
  it('labels the T776 line', () => {
    expect(taxLineLabel({ code: '8960', label: 'Repairs and maintenance' })).toBe('Line 8960');
    expect(taxLineLabel(null)).toBeUndefined();
  });
});

describe('categoryChipLabel', () => {
  it('shortens long system names and keeps the rest', () => {
    expect(categoryChipLabel({ key: 'repairs', name: 'Repairs and maintenance' })).toBe('Repairs');
    expect(categoryChipLabel({ key: 'utilities', name: 'Utilities' })).toBe('Utilities');
    expect(categoryChipLabel({ key: null, name: 'Snow removal' })).toBe('Snow removal');
  });
});
