import {
  addMonthsTo,
  currentMonthStart,
  isDateWithinMonthsAhead,
  monthsBetween,
} from '@/shared/dates';
import { MAX_AMOUNT_CENTS, MAX_MONTHS_AHEAD } from '@/shared/schemas';
import type { Category, UnitStatus } from '@/shared/types';

import { type EntryFormValues, isRentCategory } from './entry';
import { percentToBasisPoints, splitStatus } from './split';

type EntryField = 'amount' | 'property' | 'units' | 'split' | 'category' | 'date' | 'rentMonth';

type EntryErrors = Partial<Record<EntryField, string>>;

type ValidationContext = {
  /** Units of the chosen property, in order. */
  units: ReadonlyArray<{ id: string; status: UnitStatus }>;
  category: Pick<Category, 'key'> | undefined;
  timeZone: string;
};

function splitError(values: EntryFormValues, selected: readonly string[]): string | undefined {
  if (selected.length < 2 || values.splitMode === 'even') return undefined;
  const shares = selected.map((id) => percentToBasisPoints(values.customPercents[id] ?? ''));
  if (shares.some((share) => share === null || share === 0)) return 'Give every unit a share';
  const status = splitStatus(shares.map((share) => share ?? 0));
  return status.ok ? undefined : 'Split must add up to 100%';
}

function unitsError(
  values: EntryFormValues,
  selected: readonly string[],
  { units, category }: ValidationContext,
): string | undefined {
  if (units.length < 2) return undefined;
  if (isRentCategory(category) && selected.length === 0) return 'Pick the unit this rent is for';
  if (values.kind === 'income') {
    if (selected.length > 1) return 'Income goes to one unit';
    const yours = units.some(
      (unit) => selected.includes(unit.id) && unit.status === 'owner_occupied',
    );
    if (yours) return "Income can't go to a unit you live in";
  }
  return undefined;
}

function dateErrors(
  values: EntryFormValues,
  { category, timeZone }: ValidationContext,
): EntryErrors {
  if (isRentCategory(category)) {
    const limit = addMonthsTo(currentMonthStart(timeZone), MAX_MONTHS_AHEAD);
    return monthsBetween(limit, values.rentMonth) > 0
      ? { rentMonth: 'Pick a month within the next year' }
      : {};
  }
  return isDateWithinMonthsAhead(values.date, MAX_MONTHS_AHEAD, timeZone)
    ? {}
    : { date: 'Pick a date within the next year' };
}

/**
 * Checks the drawer before saving, with messages for each field. The API re-checks everything;
 * these catch it early and say exactly what to fix.
 */
function validateEntry(values: EntryFormValues, context: ValidationContext): EntryErrors {
  const selected = context.units
    .filter((unit) => values.unitIds.includes(unit.id))
    .map((unit) => unit.id);
  const errors: EntryErrors = { ...dateErrors(values, context) };

  if (values.amountCents === null || values.amountCents <= 0) {
    errors.amount = 'Enter an amount';
  } else if (values.amountCents > MAX_AMOUNT_CENTS) {
    errors.amount = 'Enter an amount up to $10,000,000';
  }
  if (values.propertyId === null) errors.property = 'Pick a property';
  if (values.categoryId === null) errors.category = 'Pick a category';

  const units = values.propertyId === null ? undefined : unitsError(values, selected, context);
  if (units !== undefined) errors.units = units;
  const split = splitError(values, selected);
  if (split !== undefined) errors.split = split;

  return errors;
}

function hasErrors(errors: EntryErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

export { type EntryErrors, type EntryField, hasErrors, validateEntry, type ValidationContext };
