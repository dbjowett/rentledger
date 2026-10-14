import { sumBy } from 'es-toolkit';

import { formatDayOrdinal, type MonthStart } from '@/shared/dates';
import type { RentDue, UnitStatus } from '@/shared/types';

/**
 * A unit as the add-property form holds it. Every field is kept whatever the status, so
 * switching Occupied → I live here → Occupied restores what was typed; the payload drops the
 * fields that don't apply.
 */
type UnitFormValues = {
  label: string;
  /** True once the user renames the unit; untouched labels follow the unit count. */
  labelTouched: boolean;
  status: UnitStatus;
  /** Monthly rent when occupied, expected rent when vacant. */
  rentCents: number | null;
  tenantName: string;
  rentDue: RentDue;
  rentStartDate: MonthStart;
};

type UnitTotals = {
  /** Sum of rent on occupied units. */
  monthlyRentCents: number;
  occupied: number;
  vacant: number;
  ownerOccupied: number;
};

const DEFAULT_RENT_DUE: RentDue = { type: 'day', day: 1 };

/** How each status is tagged in lists: Occupied green, Vacant grey, Yours blue. */
const UNIT_STATUS_TAGS: Record<
  UnitStatus,
  { label: string; tone: 'success' | 'neutral' | 'accent' }
> = {
  occupied: { label: 'Occupied', tone: 'success' },
  vacant: { label: 'Vacant', tone: 'neutral' },
  owner_occupied: { label: 'Yours', tone: 'accent' },
};

/**
 * The default name for a unit. A house's single unit is "Main", which is never shown.
 * @example defaultUnitLabel(0, 1) // 'Main'
 * @example defaultUnitLabel(2, 4) // 'Unit 3'
 */
function defaultUnitLabel(index: number, count: number): string {
  return count === 1 ? 'Main' : `Unit ${index + 1}`;
}

/** A fresh unit with the defaults: Occupied, due on the 1st, renting since `rentStartDate`. */
function createUnitFormValues(
  index: number,
  count: number,
  rentStartDate: MonthStart,
): UnitFormValues {
  return {
    label: defaultUnitLabel(index, count),
    labelTouched: false,
    status: 'occupied',
    rentCents: null,
    tenantName: '',
    rentDue: DEFAULT_RENT_DUE,
    rentStartDate,
  };
}

function withLabel(unit: UnitFormValues, label: string): UnitFormValues {
  return { ...unit, label };
}

/**
 * Grows or shrinks the unit list to `count`. Existing units keep their data by position, new
 * ones are appended with defaults, extra ones are dropped from the end, and labels the user
 * hasn't edited are renamed to match the new count ("Main" ↔ "Unit 1").
 */
function resizeUnits(
  units: readonly UnitFormValues[],
  count: number,
  rentStartDate: MonthStart,
): UnitFormValues[] {
  const kept = units.slice(0, count);
  const added = Array.from({ length: Math.max(0, count - kept.length) }, (_, offset) =>
    createUnitFormValues(kept.length + offset, count, rentStartDate),
  );
  return [...kept, ...added].map((unit, index) =>
    unit.labelTouched ? unit : withLabel(unit, defaultUnitLabel(index, count)),
  );
}

/** True when the user has entered anything on this unit, so removing it needs a confirmation. */
function unitHasData(unit: UnitFormValues): boolean {
  return (
    unit.labelTouched ||
    unit.rentCents !== null ||
    unit.tenantName.trim() !== '' ||
    unit.status !== 'occupied'
  );
}

/**
 * Rent due as a short phrase.
 * @example formatRentDue({ type: 'day', day: 22 }) // '22nd'
 * @example formatRentDue({ type: 'last' }) // 'last day'
 */
function formatRentDue(rentDue: RentDue): string {
  return rentDue.type === 'last' ? 'last day' : formatDayOrdinal(rentDue.day);
}

/** Counts and total rent for the summary lines. */
function summarizeUnits(
  units: ReadonlyArray<Pick<UnitFormValues, 'status' | 'rentCents'>>,
): UnitTotals {
  const occupiedUnits = units.filter((unit) => unit.status === 'occupied');
  return {
    monthlyRentCents: sumBy(occupiedUnits, (unit) => unit.rentCents ?? 0),
    occupied: occupiedUnits.length,
    vacant: units.filter((unit) => unit.status === 'vacant').length,
    ownerOccupied: units.filter((unit) => unit.status === 'owner_occupied').length,
  };
}

export {
  UNIT_STATUS_TAGS,
  type UnitFormValues,
  type UnitTotals,
  createUnitFormValues,
  defaultUnitLabel,
  formatRentDue,
  resizeUnits,
  summarizeUnits,
  unitHasData,
};
