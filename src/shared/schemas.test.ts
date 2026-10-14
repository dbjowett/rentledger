import { createPropertyBody, type CreatePropertyBody, type UnitBody } from './schemas';

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
