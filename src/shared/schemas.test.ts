import {
  createPropertyBody,
  type CreatePropertyBody,
  createTransactionBody,
  receiptUploadBody,
  type UnitBody,
} from './schemas';

const occupied: UnitBody = {
  status: 'occupied',
  label: 'Unit 1',
  rent_cents: 145_000,
  rent_due: { type: 'day', day: 1 },
  rent_start_date: '2026-10-01',
};

function body(units: UnitBody[], overrides: Partial<CreatePropertyBody> = {}): unknown {
  return { address: '123 Cedar Row, Toronto ON', name: 'Cedar Row', units, ...overrides };
}

function messages(input: unknown): string[] {
  const result = createPropertyBody.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('createPropertyBody', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-14T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts a 4-unit property with mixed statuses', () => {
    const result = createPropertyBody.safeParse(
      body([
        occupied,
        { ...occupied, label: 'Unit 2', rent_due: { type: 'last' }, tenant_name: 'Sam' },
        { status: 'vacant', label: 'Unit 3', rent_cents: 150_000 },
        { status: 'owner_occupied', label: 'My unit' },
      ]),
    );
    expect(result.success).toBe(true);
  });

  it('accepts a house and defaults ownership to 100', () => {
    const result = createPropertyBody.safeParse(body([{ ...occupied, label: 'Main' }]));
    expect(result.success && result.data.ownership_pct).toBe(100);
  });

  it('accepts due days 1, 15, 28 and last day; rejects 29', () => {
    for (const day of [1, 15, 28]) {
      expect(messages(body([{ ...occupied, rent_due: { type: 'day', day } }]))).toEqual([]);
    }
    expect(messages(body([{ ...occupied, rent_due: { type: 'last' } }]))).toEqual([]);
    expect(messages(body([{ ...occupied, rent_due: { type: 'day', day: 29 } }]))).not.toEqual([]);
  });

  it('requires rent above $0 on occupied units', () => {
    expect(messages(body([{ ...occupied, rent_cents: 0 }]))).toContain('Enter the monthly rent');
  });

  it('rejects a property where every unit is "I live here"', () => {
    expect(
      messages(
        body([
          { status: 'owner_occupied', label: 'Up' },
          { status: 'owner_occupied', label: 'Down' },
        ]),
      ),
    ).toContain('At least one unit has to be rented or vacant.');
  });

  it('rejects "I live here" on a single-unit property', () => {
    expect(messages(body([{ status: 'owner_occupied', label: 'Main' }]))).toContain(
      "A single-unit property can't be owner-occupied.",
    );
  });

  it('rejects duplicate labels regardless of case', () => {
    expect(messages(body([occupied, { status: 'vacant', label: ' unit 1 ' }]))).toContain(
      'Each unit needs a different name',
    );
  });

  it('limits renting since to real months within a year', () => {
    expect(messages(body([{ ...occupied, rent_start_date: '2027-10-01' }]))).toEqual([]);
    expect(messages(body([{ ...occupied, rent_start_date: '2027-11-01' }]))).toContain(
      'Pick a month within the next year',
    );
    expect(messages(body([{ ...occupied, rent_start_date: '2026-10-14' }]))).toContain(
      'Pick a month',
    );
  });

  it('bounds the ownership share', () => {
    expect(messages(body([occupied], { ownership_pct: 50 }))).toEqual([]);
    expect(messages(body([occupied], { ownership_pct: 0 }))).not.toEqual([]);
    expect(messages(body([occupied], { ownership_pct: 101 }))).not.toEqual([]);
  });

  it('requires an address', () => {
    expect(messages(body([occupied], { address: '  ' }))).toContain("Enter the property's address");
  });
});

function entryMessages(input: unknown): string[] {
  const result = createTransactionBody.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('createTransactionBody', () => {
  const PROPERTY = '11111111-1111-4111-8111-111111111111';
  const CATEGORY = '22222222-2222-4222-8222-222222222222';
  const UNIT_A = '33333333-3333-4333-8333-333333333333';
  const UNIT_B = '44444444-4444-4444-8444-444444444444';

  const base = {
    kind: 'expense',
    amount_cents: 10_000,
    property_id: PROPERTY,
    category_id: CATEGORY,
    date: '2026-10-08',
    target: { type: 'building' },
  };

  function split(...basisPoints: number[]) {
    const ids = [UNIT_A, UNIT_B, '55555555-5555-4555-8555-555555555555'];
    return {
      type: 'split',
      mode: 'custom',
      units: basisPoints.map((bp, index) => ({ unit_id: ids[index], basis_points: bp })),
    };
  }

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-14T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts a whole-building expense and fills the defaults', () => {
    const result = createTransactionBody.safeParse(base);
    expect(result.success && result.data).toMatchObject({
      is_capital: false,
      repeat_monthly: false,
    });
  });

  it('accepts a single unit and a split that totals 100%', () => {
    expect(entryMessages({ ...base, target: { type: 'unit', unit_id: UNIT_A } })).toEqual([]);
    expect(entryMessages({ ...base, target: split(2500, 7500) })).toEqual([]);
    expect(entryMessages({ ...base, target: split(3333, 3333, 3334) })).toEqual([]);
  });

  it('rejects a split that is off, has one unit, or repeats a unit', () => {
    expect(entryMessages({ ...base, target: split(2500, 7000) })).toContain(
      'Split must add up to 100%',
    );
    expect(entryMessages({ ...base, target: split(10_000) })).toContain(
      'Pick at least two units to split',
    );
    expect(
      entryMessages({
        ...base,
        target: {
          type: 'split',
          mode: 'even',
          units: [
            { unit_id: UNIT_A, basis_points: 5000 },
            { unit_id: UNIT_A, basis_points: 5000 },
          ],
        },
      }),
    ).toContain('Each unit can only appear once in a split');
  });

  it('rejects income splits and capital income', () => {
    expect(entryMessages({ ...base, kind: 'income', target: split(5000, 5000) })).toContain(
      'Income goes to one unit',
    );
    expect(entryMessages({ ...base, kind: 'income', is_capital: true })).toContain(
      'Only expenses can be capital improvements',
    );
  });

  it('bounds the amount', () => {
    expect(entryMessages({ ...base, amount_cents: 0 })).toContain('Enter an amount above $0');
    expect(entryMessages({ ...base, amount_cents: 1_000_000_001 })).toContain(
      'Enter an amount up to $10,000,000',
    );
    expect(entryMessages({ ...base, amount_cents: 1_000_000_000 })).toEqual([]);
  });

  it('accepts real dates up to a year ahead', () => {
    expect(entryMessages({ ...base, date: '2027-10-14' })).toEqual([]);
    expect(entryMessages({ ...base, date: '2027-10-15' })).toContain(
      'Pick a date within the next year',
    );
    expect(entryMessages({ ...base, date: '2026-02-30' })).toContain('Pick a date');
  });

  it('limits the note to 500 characters', () => {
    expect(entryMessages({ ...base, note: 'x'.repeat(500) })).toEqual([]);
    expect(entryMessages({ ...base, note: 'x'.repeat(501) })).not.toEqual([]);
  });
});

describe('receiptUploadBody', () => {
  it('accepts JPEG and PDF up to 15 MB', () => {
    expect(
      receiptUploadBody.safeParse({ mime_type: 'image/jpeg', size_bytes: 400_000 }).success,
    ).toBe(true);
    expect(
      receiptUploadBody.safeParse({ mime_type: 'application/pdf', size_bytes: 15_000_000 }).success,
    ).toBe(true);
  });

  it('rejects other types and larger files', () => {
    expect(receiptUploadBody.safeParse({ mime_type: 'image/png', size_bytes: 1 }).success).toBe(
      false,
    );
    expect(
      receiptUploadBody.safeParse({ mime_type: 'image/jpeg', size_bytes: 15_000_001 }).success,
    ).toBe(false);
  });
});
