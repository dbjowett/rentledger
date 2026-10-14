import { nameFromAddress, toCreatePropertyPayload, type PropertyFormValues } from './property';
import { createUnitFormValues } from './units';

const MONTH = '2026-10-01';

function form(overrides: Partial<PropertyFormValues> = {}): PropertyFormValues {
  return {
    address: ' 123 Cedar Row, Toronto ON ',
    name: ' Cedar Row ',
    nameTouched: true,
    ownershipPct: 100,
    units: [{ ...createUnitFormValues(0, 1, MONTH), rentCents: 180_000 }],
    ...overrides,
  };
}

describe('nameFromAddress', () => {
  it('takes the text before the first comma', () => {
    expect(nameFromAddress('123 Cedar Row, Toronto ON')).toBe('123 Cedar Row');
    expect(nameFromAddress('  45 Elm St  ')).toBe('45 Elm St');
    expect(nameFromAddress('Unit 4, 12 Bay St, Toronto')).toBe('Unit 4');
    expect(nameFromAddress('')).toBe('');
  });
});

describe('toCreatePropertyPayload', () => {
  it('trims text and sends a house’s single occupied unit', () => {
    expect(toCreatePropertyPayload(form())).toEqual({
      address: '123 Cedar Row, Toronto ON',
      name: 'Cedar Row',
      ownershipPct: 100,
      units: [
        {
          status: 'occupied',
          label: 'Main',
          rentCents: 180_000,
          rentDue: { type: 'day', day: 1 },
          rentStartDate: MONTH,
        },
      ],
    });
  });

  it('defaults an empty ownership share to 100', () => {
    expect(toCreatePropertyPayload(form({ ownershipPct: null })).ownershipPct).toBe(100);
    expect(toCreatePropertyPayload(form({ ownershipPct: 50 })).ownershipPct).toBe(50);
  });

  it('sends only the fields each status allows', () => {
    const base = createUnitFormValues(0, 3, MONTH);
    const payload = toCreatePropertyPayload(
      form({
        units: [
          { ...base, label: 'Unit 1', rentCents: 145_000, tenantName: ' Sam ' },
          { ...base, label: 'Unit 2', status: 'vacant', rentCents: 150_000, tenantName: 'Old' },
          {
            ...base,
            label: ' Upstairs ',
            status: 'owner_occupied',
            rentCents: 99_000,
            tenantName: 'Me',
            rentDue: { type: 'last' },
          },
        ],
      }),
    );

    expect(payload.units).toEqual([
      {
        status: 'occupied',
        label: 'Unit 1',
        rentCents: 145_000,
        rentDue: { type: 'day', day: 1 },
        rentStartDate: MONTH,
        tenantName: 'Sam',
      },
      { status: 'vacant', label: 'Unit 2', rentCents: 150_000 },
      { status: 'owner_occupied', label: 'Upstairs' },
    ]);
  });

  it('omits a blank tenant and an empty expected rent', () => {
    const base = createUnitFormValues(0, 2, MONTH);
    const payload = toCreatePropertyPayload(
      form({
        units: [
          { ...base, rentCents: 100_000, tenantName: '   ' },
          { ...base, label: 'Unit 2', status: 'vacant' },
        ],
      }),
    );
    expect(payload.units[0]).not.toHaveProperty('tenantName');
    expect(payload.units[1]).toEqual({ status: 'vacant', label: 'Unit 2' });
  });
});
