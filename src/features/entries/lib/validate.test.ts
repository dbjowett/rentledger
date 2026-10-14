import type { EntryFormValues } from './entry';
import { hasErrors, validateEntry, type ValidationContext } from './validate';

const units: ValidationContext['units'] = [
  { id: 'a', status: 'occupied' },
  { id: 'b', status: 'vacant' },
  { id: 'mine', status: 'owner_occupied' },
];

function values(overrides: Partial<EntryFormValues> = {}): EntryFormValues {
  return {
    kind: 'expense',
    amountCents: 10_000,
    propertyId: 'p',
    unitIds: [],
    splitMode: 'even',
    customPercents: {},
    categoryId: 'c',
    date: '2026-10-08',
    rentMonth: '2026-10-01',
    isCapital: false,
    note: '',
    repeatMonthly: false,
    receiptId: null,
    ...overrides,
  };
}

const context: ValidationContext = { units, category: { key: 'repairs' }, timeZone: 'UTC' };
const rent: ValidationContext = { ...context, category: { key: 'rent' } };

describe('validateEntry', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-14T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('passes a complete whole-building expense', () => {
    const errors = validateEntry(values(), context);
    expect(hasErrors(errors)).toBe(false);
  });

  it('requires an amount, a property and a category', () => {
    expect(
      validateEntry(values({ amountCents: null, propertyId: null, categoryId: null }), context),
    ).toEqual({
      amount: 'Enter an amount',
      property: 'Pick a property',
      category: 'Pick a category',
    });
  });

  it('caps the amount', () => {
    expect(validateEntry(values({ amountCents: 1_000_000_001 }), context).amount).toBe(
      'Enter an amount up to $10,000,000',
    );
  });

  it('needs a unit for rent on a multi-unit property, but not on a house', () => {
    expect(validateEntry(values({ kind: 'income' }), rent).units).toBe(
      'Pick the unit this rent is for',
    );
    const house = { ...rent, units: [{ id: 'a', status: 'occupied' as const }] };
    expect(validateEntry(values({ kind: 'income' }), house).units).toBeUndefined();
  });

  it('keeps income to one unit that isn’t yours', () => {
    expect(validateEntry(values({ kind: 'income', unitIds: ['a', 'b'] }), context).units).toBe(
      'Income goes to one unit',
    );
    expect(validateEntry(values({ kind: 'income', unitIds: ['mine'] }), context).units).toBe(
      "Income can't go to a unit you live in",
    );
  });

  it('checks custom splits add up to 100%', () => {
    const custom = { unitIds: ['a', 'b'], splitMode: 'custom' as const };
    expect(
      validateEntry(values({ ...custom, customPercents: { a: '25', b: '75' } }), context).split,
    ).toBeUndefined();
    expect(
      validateEntry(values({ ...custom, customPercents: { a: '25', b: '70' } }), context).split,
    ).toBe('Split must add up to 100%');
    expect(
      validateEntry(values({ ...custom, customPercents: { a: '100', b: '' } }), context).split,
    ).toBe('Give every unit a share');
  });

  it('limits dates and rent months to a year ahead', () => {
    expect(validateEntry(values({ date: '2027-10-15' }), context).date).toBe(
      'Pick a date within the next year',
    );
    expect(
      validateEntry(values({ kind: 'income', unitIds: ['a'], rentMonth: '2027-11-01' }), rent)
        .rentMonth,
    ).toBe('Pick a month within the next year');
    const inLimit = values({ kind: 'income', unitIds: ['a'], rentMonth: '2027-10-01' });
    expect(hasErrors(validateEntry(inLimit, rent))).toBe(false);
  });
});
