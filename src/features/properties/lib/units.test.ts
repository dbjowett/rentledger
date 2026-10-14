import {
  createUnitFormValues,
  defaultUnitLabel,
  formatRentDue,
  resizeUnits,
  summarizeUnits,
  unitHasData,
  type UnitFormValues,
} from './units';

const MONTH = '2026-10-01';

function unit(overrides: Partial<UnitFormValues> = {}): UnitFormValues {
  return { ...createUnitFormValues(0, 2, MONTH), ...overrides };
}

describe('defaultUnitLabel', () => {
  it('names a house’s only unit "Main" and numbers the rest', () => {
    expect(defaultUnitLabel(0, 1)).toBe('Main');
    expect(defaultUnitLabel(0, 4)).toBe('Unit 1');
    expect(defaultUnitLabel(3, 4)).toBe('Unit 4');
  });
});

describe('resizeUnits', () => {
  it('appends defaults when growing', () => {
    const units = resizeUnits([unit({ rentCents: 145_000 })], 3, MONTH);
    expect(units).toHaveLength(3);
    expect(units[0]?.rentCents).toBe(145_000);
    expect(units[2]).toMatchObject({ label: 'Unit 3', status: 'occupied', rentCents: null });
  });

  it('drops units from the end when shrinking', () => {
    const units = resizeUnits(
      [unit({ tenantName: 'A' }), unit({ tenantName: 'B' }), unit({ tenantName: 'C' })],
      2,
      MONTH,
    );
    expect(units.map((u) => u.tenantName)).toEqual(['A', 'B']);
  });

  it('relabels untouched units and keeps renamed ones', () => {
    const house = resizeUnits([], 1, MONTH);
    expect(house[0]?.label).toBe('Main');

    const duplex = resizeUnits(house, 2, MONTH);
    expect(duplex.map((u) => u.label)).toEqual(['Unit 1', 'Unit 2']);

    const renamed = resizeUnits([unit({ label: 'Upstairs', labelTouched: true })], 2, MONTH);
    expect(renamed.map((u) => u.label)).toEqual(['Upstairs', 'Unit 2']);
  });
});

describe('unitHasData', () => {
  it('is false for an untouched default unit', () => {
    expect(unitHasData(unit())).toBe(false);
  });

  it('is true once anything was entered', () => {
    expect(unitHasData(unit({ rentCents: 1 }))).toBe(true);
    expect(unitHasData(unit({ tenantName: 'Sam' }))).toBe(true);
    expect(unitHasData(unit({ labelTouched: true }))).toBe(true);
    expect(unitHasData(unit({ status: 'vacant' }))).toBe(true);
  });
});

describe('formatRentDue', () => {
  it('formats fixed days and the last day', () => {
    expect(formatRentDue({ type: 'day', day: 1 })).toBe('1st');
    expect(formatRentDue({ type: 'day', day: 15 })).toBe('15th');
    expect(formatRentDue({ type: 'day', day: 22 })).toBe('22nd');
    expect(formatRentDue({ type: 'last' })).toBe('last day');
  });
});

describe('summarizeUnits', () => {
  it('totals rent on occupied units only', () => {
    const totals = summarizeUnits([
      { status: 'occupied', rentCents: 145_000 },
      { status: 'occupied', rentCents: 140_000 },
      { status: 'vacant', rentCents: 150_000 },
      { status: 'owner_occupied', rentCents: 99 },
    ]);
    expect(totals).toEqual({ monthlyRentCents: 285_000, occupied: 2, vacant: 1, ownerOccupied: 1 });
  });
});
