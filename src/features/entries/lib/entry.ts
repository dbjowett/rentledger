import { dueDateInMonth, type IsoDate, type MonthStart } from '@/shared/dates';
import type { EntryKind } from '@/shared/schemas';
import type { Category, CreateTransactionInput, RentDue } from '@/shared/types';

import { evenBasisPoints, percentToBasisPoints } from './split';

type SplitMode = 'even' | 'custom';

/** The new-entry form. Selection state lives here too, so one form drives the whole drawer. */
type EntryFormValues = {
  kind: EntryKind;
  amountCents: number | null;
  propertyId: string | null;
  /** Selected units; empty means the whole building. */
  unitIds: string[];
  splitMode: SplitMode;
  /** Typed percentages per unit id, used when `splitMode` is custom. */
  customPercents: Record<string, string>;
  categoryId: string | null;
  /** The entry date, for every category except Rent. */
  date: IsoDate;
  /** The month rent is for, when the category is Rent. */
  rentMonth: MonthStart;
  isCapital: boolean;
  note: string;
  repeatMonthly: boolean;
  receiptId: string | null;
};

/** A unit of the chosen property, as the drawer needs it. */
type EntryUnit = { id: string; rentDue: RentDue | null };

type EntryTarget = CreateTransactionInput['target'];

/** System category keys with special rules in the drawer. */
const RENT_KEY = 'rent';
const MORTGAGE_KEYS: ReadonlySet<string> = new Set(['mortgage_interest', 'mortgage_principal']);

/** First day of the month when a unit has no due day of its own. */
const FALLBACK_RENT_DUE: RentDue = { type: 'day', day: 1 };

function isRentCategory(category: Pick<Category, 'key'> | undefined): boolean {
  return category?.key === RENT_KEY;
}

/** Mortgage payments get their own flow later, so these hide "Repeat monthly". */
function isMortgageCategory(category: Pick<Category, 'key'> | undefined): boolean {
  return category?.key != null && MORTGAGE_KEYS.has(category.key);
}

/**
 * The day rent for `month` is due on a unit; rent counts in the month it's for, not when paid.
 * @example rentDateFor('2026-10-01', { type: 'last' }) // '2026-10-31'
 */
function rentDateFor(month: MonthStart, rentDue: RentDue | null): IsoDate {
  return dueDateInMonth(month, rentDue ?? FALLBACK_RENT_DUE);
}

/**
 * Where the money goes. A house always goes to its single unit; otherwise no units is the
 * whole building, one unit is that unit, and two or more is a split in property order.
 */
function toEntryTarget(
  selectedUnitIds: readonly string[],
  propertyUnitIds: readonly string[],
  mode: SplitMode,
  customPercents: Readonly<Record<string, string>>,
): EntryTarget {
  const [onlyUnit] = propertyUnitIds;
  if (propertyUnitIds.length === 1 && onlyUnit !== undefined) {
    return { type: 'unit', unitId: onlyUnit };
  }

  const selected = propertyUnitIds.filter((id) => selectedUnitIds.includes(id));
  const [first] = selected;
  if (first === undefined) return { type: 'building' };
  if (selected.length === 1) return { type: 'unit', unitId: first };

  const even = evenBasisPoints(selected.length);
  return {
    type: 'split',
    mode,
    units: selected.map((unitId, index) => ({
      unitId,
      basisPoints:
        mode === 'even'
          ? (even[index] ?? 0)
          : (percentToBasisPoints(customPercents[unitId] ?? '') ?? 0),
    })),
  };
}

/** Context the payload needs that isn't in the form itself. */
type PayloadContext = {
  units: readonly EntryUnit[];
  category: Pick<Category, 'key'> | undefined;
};

/**
 * Turns validated form values into the API input: builds the target, dates rent by the month
 * it's for, and drops options that don't apply (capital on income, repeat on mortgage).
 */
function toCreateTransactionPayload(
  values: EntryFormValues,
  { units, category }: PayloadContext,
): CreateTransactionInput {
  const target = toEntryTarget(
    values.unitIds,
    units.map((unit) => unit.id),
    values.splitMode,
    values.customPercents,
  );
  const rentUnit =
    target.type === 'unit' ? units.find((unit) => unit.id === target.unitId) : undefined;
  const date = isRentCategory(category)
    ? rentDateFor(values.rentMonth, rentUnit?.rentDue ?? null)
    : values.date;
  const note = values.note.trim();

  return {
    kind: values.kind,
    amountCents: values.amountCents ?? 0,
    propertyId: values.propertyId ?? '',
    categoryId: values.categoryId ?? '',
    target,
    date,
    isCapital: values.kind === 'expense' && values.isCapital,
    repeatMonthly: values.repeatMonthly && !isMortgageCategory(category),
    ...(note === '' ? {} : { note }),
    ...(values.receiptId === null ? {} : { receiptId: values.receiptId }),
  };
}

export {
  type EntryFormValues,
  type EntryTarget,
  type EntryUnit,
  isMortgageCategory,
  isRentCategory,
  type PayloadContext,
  rentDateFor,
  type SplitMode,
  toCreateTransactionPayload,
  toEntryTarget,
};
