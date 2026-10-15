import { sortBy } from 'es-toolkit';

import { entryApi } from '@/features/entries/api';
import { evenBasisPoints } from '@/features/entries/lib/split';
import { propertyApi } from '@/features/properties/api';
import { ApiRequestError } from '@/lib/api';
import { currentMonthStart, dueDateInMonth, todayIn } from '@/shared/dates';
import type { CreateTransactionInput, Property, Transaction } from '@/shared/types';

type CheckResult = { name: string; ok: boolean; detail: string };

const NOTE = '[dev test]';
const MIN_UNITS = 3;

async function findTestProperty(): Promise<Property | null> {
  const list = await propertyApi.list();
  for (const summary of list) {
    if (summary.unitCount >= MIN_UNITS) return propertyApi.get(summary.id);
  }
  return null;
}

async function expectSaved(
  name: string,
  input: CreateTransactionInput,
  verify: (saved: Transaction) => string | null,
): Promise<CheckResult> {
  try {
    const saved = await entryApi.create(input);
    const problem = verify(saved);
    return { name, ok: problem === null, detail: problem ?? 'saved' };
  } catch (error) {
    return { name, ok: false, detail: error instanceof Error ? error.message : 'failed' };
  }
}

async function expectRejected(name: string, input: CreateTransactionInput): Promise<CheckResult> {
  try {
    await entryApi.create(input);
    return { name, ok: false, detail: 'was saved, expected a 400' };
  } catch (error) {
    const rejected = error instanceof ApiRequestError && error.status === 400;
    return { name, ok: rejected, detail: error instanceof Error ? error.message : 'failed' };
  }
}

/**
 * Runs the add-entry data checklist against the real API, on the first property with 3+ units.
 * Valid cases create real entries noted "[dev test]".
 */
async function runEntryApiChecks(timeZone: string): Promise<CheckResult[]> {
  const property = await findTestProperty();
  if (property === null) {
    return [{ name: 'setup', ok: false, detail: 'Needs a property with 3 or more units' }];
  }
  const [expenses, income] = await Promise.all([
    entryApi.categories('expense'),
    entryApi.categories('income'),
  ]);
  const repairs = expenses.find((category) => category.key === 'repairs');
  const rent = income.find((category) => category.key === 'rent');
  const otherIncome = income.find((category) => category.key === 'other_income');
  if (repairs === undefined || rent === undefined || otherIncome === undefined) {
    return [{ name: 'setup', ok: false, detail: 'System categories missing' }];
  }

  const [a, b, c] = property.units;
  const rented = property.units.find((unit) => unit.status !== 'owner_occupied');
  const yours = property.units.find((unit) => unit.status === 'owner_occupied');
  if (a === undefined || b === undefined || c === undefined || rented === undefined) {
    return [{ name: 'setup', ok: false, detail: 'Property units missing' }];
  }

  const today = todayIn(timeZone);
  const base: CreateTransactionInput = {
    kind: 'expense',
    amountCents: 10_000,
    propertyId: property.id,
    categoryId: repairs.id,
    date: today,
    target: { type: 'building' },
    note: NOTE,
  };
  const even = evenBasisPoints(3);
  const rentDate = dueDateInMonth(
    currentMonthStart(timeZone),
    rented.rentDue ?? { type: 'day', day: 1 },
  );

  const checks: Array<Promise<CheckResult>> = [
    expectSaved('whole-building expense', base, (saved) =>
      saved.unitId === null && saved.splits.length === 0 ? null : 'expected no unit and no splits',
    ),
    expectSaved(
      'single-unit expense',
      { ...base, target: { type: 'unit', unitId: a.id } },
      (saved) => (saved.unitId === a.id ? null : 'wrong unit'),
    ),
    expectSaved(
      '3-way even split of $100',
      {
        ...base,
        target: {
          type: 'split',
          mode: 'even',
          units: [a, b, c].map((unit, index) => ({
            unitId: unit.id,
            basisPoints: even[index] ?? 0,
          })),
        },
      },
      (saved) => {
        const amounts = sortBy(saved.splits, [(split) => split.amountCents]).map(
          (split) => split.amountCents,
        );
        return amounts.join('/') === '3333/3333/3334' ? null : `got ${amounts.join('/')}`;
      },
    ),
    expectSaved(
      'custom 25/75 of $100',
      {
        ...base,
        target: {
          type: 'split',
          mode: 'custom',
          units: [
            { unitId: a.id, basisPoints: 2500 },
            { unitId: b.id, basisPoints: 7500 },
          ],
        },
      },
      (saved) => {
        const amounts = sortBy(saved.splits, [(split) => split.amountCents]).map(
          (split) => split.amountCents,
        );
        return amounts.join('/') === '2500/7500' ? null : `got ${amounts.join('/')}`;
      },
    ),
    expectSaved(
      `rent for ${rented.label}`,
      {
        ...base,
        kind: 'income',
        categoryId: rent.id,
        amountCents: rented.rentCents ?? 100_000,
        date: rentDate,
        target: { type: 'unit', unitId: rented.id },
      },
      (saved) => (saved.date === rentDate ? null : `dated ${saved.date}`),
    ),
    expectSaved('capital expense', { ...base, amountCents: 1_500_000, isCapital: true }, (saved) =>
      saved.isCapital ? null : 'not marked capital',
    ),
    expectSaved('repeat monthly', { ...base, repeatMonthly: true }, (saved) =>
      saved.recurringRuleId !== null && saved.occurrenceDate === saved.date
        ? null
        : 'no rule linked',
    ),
    expectRejected('custom 25/70 rejected', {
      ...base,
      target: {
        type: 'split',
        mode: 'custom',
        units: [
          { unitId: a.id, basisPoints: 2500 },
          { unitId: b.id, basisPoints: 7000 },
        ],
      },
    }),
    expectRejected('rent without a unit rejected', {
      ...base,
      kind: 'income',
      categoryId: rent.id,
    }),
    expectRejected('capital income rejected', {
      ...base,
      kind: 'income',
      categoryId: otherIncome.id,
      isCapital: true,
      target: { type: 'unit', unitId: rented.id },
    }),
  ];
  if (yours !== undefined) {
    checks.push(
      expectRejected('income on "I live here" rejected', {
        ...base,
        kind: 'income',
        categoryId: otherIncome.id,
        target: { type: 'unit', unitId: yours.id },
      }),
    );
  }

  const results = await Promise.all(checks);
  return [
    { name: `on ${property.name}`, ok: true, detail: `${property.units.length} units` },
    ...results,
  ];
}

export { type CheckResult, runEntryApiChecks };
