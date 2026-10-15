import {
  type EntryFormValues,
  isMortgageCategory,
  isRentCategory,
  rentDateFor,
  toCreateTransactionPayload,
  toEntryTarget,
} from './entry';

const A = 'unit-a';
const B = 'unit-b';
const C = 'unit-c';
const MULTI = [A, B, C];

const units = [
  { id: A, rentDue: { type: 'day', day: 1 } as const },
  { id: B, rentDue: { type: 'last' } as const },
  { id: C, rentDue: null },
];

function values(overrides: Partial<EntryFormValues> = {}): EntryFormValues {
  return {
    kind: 'expense',
    amountCents: 10_000,
    propertyId: 'property-1',
    unitIds: [],
    splitMode: 'even',
    customPercents: {},
    categoryId: 'category-1',
    date: '2026-10-08',
    rentMonth: '2026-10-01',
    isCapital: false,
    note: '',
    repeatMonthly: false,
    receiptId: null,
    ...overrides,
  };
}

describe('toEntryTarget', () => {
  it('sends a house to its single unit', () => {
    expect(toEntryTarget([], [A], 'even', {})).toEqual({ type: 'unit', unitId: A });
  });

  it('uses the whole building when no unit is selected', () => {
    expect(toEntryTarget([], MULTI, 'even', {})).toEqual({ type: 'building' });
  });

  it('uses one unit when one is selected', () => {
    expect(toEntryTarget([B], MULTI, 'even', {})).toEqual({ type: 'unit', unitId: B });
  });

  it('splits evenly in property order', () => {
    expect(toEntryTarget([C, A, B], MULTI, 'even', {})).toEqual({
      type: 'split',
      mode: 'even',
      units: [
        { unitId: A, basisPoints: 3333 },
        { unitId: B, basisPoints: 3333 },
        { unitId: C, basisPoints: 3334 },
      ],
    });
  });

  it('uses custom percentages', () => {
    expect(toEntryTarget([A, B], MULTI, 'custom', { [A]: '25', [B]: '75' })).toEqual({
      type: 'split',
      mode: 'custom',
      units: [
        { unitId: A, basisPoints: 2500 },
        { unitId: B, basisPoints: 7500 },
      ],
    });
  });

  it('ignores selected ids that aren’t on the property', () => {
    expect(toEntryTarget(['gone', B], MULTI, 'even', {})).toEqual({ type: 'unit', unitId: B });
  });
});

describe('rentDateFor', () => {
  it('uses the unit’s due day, falling back to the 1st', () => {
    expect(rentDateFor('2026-10-01', { type: 'last' })).toBe('2026-10-31');
    expect(rentDateFor('2027-02-01', { type: 'last' })).toBe('2027-02-28');
    expect(rentDateFor('2026-10-01', { type: 'day', day: 15 })).toBe('2026-10-15');
    expect(rentDateFor('2026-10-01', null)).toBe('2026-10-01');
  });
});

describe('category rules', () => {
  it('recognises rent and mortgage categories by key', () => {
    expect(isRentCategory({ key: 'rent' })).toBe(true);
    expect(isRentCategory({ key: 'repairs' })).toBe(false);
    expect(isRentCategory(undefined)).toBe(false);
    expect(isMortgageCategory({ key: 'mortgage_interest' })).toBe(true);
    expect(isMortgageCategory({ key: 'mortgage_principal' })).toBe(true);
    expect(isMortgageCategory({ key: null })).toBe(false);
  });
});

describe('toCreateTransactionPayload', () => {
  it('builds a whole-building expense', () => {
    expect(
      toCreateTransactionPayload(values({ note: '  Leaky faucet ' }), {
        units,
        category: { key: 'repairs' },
      }),
    ).toEqual({
      kind: 'expense',
      amountCents: 10_000,
      propertyId: 'property-1',
      categoryId: 'category-1',
      target: { type: 'building' },
      date: '2026-10-08',
      isCapital: false,
      repeatMonthly: false,
      note: 'Leaky faucet',
    });
  });

  it('dates rent by the month it’s for and the unit’s due day', () => {
    const payload = toCreateTransactionPayload(
      values({ kind: 'income', unitIds: [B], date: '2026-11-03', rentMonth: '2026-10-01' }),
      { units, category: { key: 'rent' } },
    );
    expect(payload.date).toBe('2026-10-31');
    expect(payload.target).toEqual({ type: 'unit', unitId: B });
  });

  it('drops capital on income and repeat on mortgage categories', () => {
    expect(
      toCreateTransactionPayload(values({ kind: 'income', isCapital: true, unitIds: [A] }), {
        units,
        category: { key: 'other_income' },
      }).isCapital,
    ).toBe(false);
    expect(
      toCreateTransactionPayload(values({ repeatMonthly: true }), {
        units,
        category: { key: 'mortgage_interest' },
      }).repeatMonthly,
    ).toBe(false);
  });

  it('includes the receipt when one was uploaded', () => {
    expect(
      toCreateTransactionPayload(values({ receiptId: 'receipt-1' }), {
        units,
        category: { key: 'repairs' },
      }).receiptId,
    ).toBe('receipt-1');
  });
});
