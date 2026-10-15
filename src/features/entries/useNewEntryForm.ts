import { useState } from 'react';
import { useForm, type Path, type PathValue } from 'react-hook-form';

import { currentMonthStart, todayIn } from '@/shared/dates';
import type { EntryKind } from '@/shared/schemas';
import type { Unit } from '@/shared/types';

import { useProperty } from '../properties/queries';
import {
  type EntryFormValues,
  isMortgageCategory,
  type SplitMode,
  toCreateTransactionPayload,
} from './lib/entry';
import { evenPercents } from './lib/split';
import { hasErrors, validateEntry } from './lib/validate';
import { useCategories } from './queries';

/** What the drawer opens with. */
type NewEntryOptions = {
  propertyId?: string | null;
  kind?: EntryKind;
};

const WHOLE_BUILDING = 'building';

function blankValues(timeZone: string, options: NewEntryOptions = {}): EntryFormValues {
  return {
    kind: options.kind ?? 'expense',
    amountCents: null,
    propertyId: options.propertyId ?? null,
    unitIds: [],
    splitMode: 'even',
    customPercents: {},
    categoryId: null,
    date: todayIn(timeZone),
    rentMonth: currentMonthStart(timeZone),
    isCapital: false,
    note: '',
    repeatMonthly: false,
    receiptId: null,
  };
}

/** Keeps the selection in property order. */
function inPropertyOrder(units: readonly Unit[], ids: readonly string[]): string[] {
  return units.filter((unit) => ids.includes(unit.id)).map((unit) => unit.id);
}

/**
 * State for the new-entry drawer: one react-hook-form form plus the live rules between fields
 * (switching to income trims units, changing property resets units, mortgage hides repeat).
 * Errors appear after the first Save and then update as fields change.
 */
function useNewEntryForm(timeZone: string) {
  const form = useForm<EntryFormValues>({ defaultValues: blankValues(timeZone) });
  const values = form.watch();
  const [checked, setChecked] = useState(false);

  const property = useProperty(values.propertyId);
  const categories = useCategories(values.kind);
  const units = values.propertyId === null ? [] : (property.data?.units ?? []);
  const category = categories.data?.find((item) => item.id === values.categoryId);
  const context = { units, category, timeZone };
  const errors = checked ? validateEntry(values, context) : {};

  const set = <K extends Path<EntryFormValues>>(key: K, value: PathValue<EntryFormValues, K>) => {
    form.setValue(key, value, { shouldDirty: true });
  };

  const setUnitIds = (ids: string[]) => {
    const ordered = inPropertyOrder(units, ids);
    set('unitIds', ordered);
    if (form.getValues('splitMode') === 'custom') set('customPercents', evenPercents(ordered));
  };

  const setKind = (kind: EntryKind) => {
    if (kind === form.getValues('kind')) return;
    set('kind', kind);
    set('categoryId', null);
    if (kind === 'income') {
      const keep = units.find(
        (unit) => values.unitIds.includes(unit.id) && unit.status !== 'owner_occupied',
      );
      set('unitIds', keep === undefined ? [] : [keep.id]);
      set('splitMode', 'even');
      set('isCapital', false);
    }
  };

  const setProperty = (propertyId: string) => {
    set('propertyId', propertyId);
    set('unitIds', []);
    set('splitMode', 'even');
    set('customPercents', {});
  };

  /** Chips: "Whole building" clears units; a unit toggles (expense) or replaces (income). */
  const toggleUnit = (value: string) => {
    if (value === WHOLE_BUILDING) {
      setUnitIds([]);
      return;
    }
    const current = form.getValues('unitIds');
    if (form.getValues('kind') === 'income') {
      setUnitIds(current.includes(value) ? [] : [value]);
      return;
    }
    setUnitIds(
      current.includes(value) ? current.filter((id) => id !== value) : [...current, value],
    );
  };

  const setSplitMode = (mode: SplitMode) => {
    set('splitMode', mode);
    if (mode === 'custom') set('customPercents', evenPercents(form.getValues('unitIds')));
  };

  const setPercent = (unitId: string, percent: string) => {
    set('customPercents', { ...form.getValues('customPercents'), [unitId]: percent });
  };

  const resetSplit = () => set('customPercents', evenPercents(form.getValues('unitIds')));

  const setCategory = (categoryId: string) => {
    set('categoryId', categoryId);
    const picked = categories.data?.find((item) => item.id === categoryId);
    if (isMortgageCategory(picked)) set('repeatMonthly', false);
  };

  /** Starts a fresh entry; defaults don't count as edits. */
  const reset = (options: NewEntryOptions = {}) => {
    form.reset(blankValues(timeZone, options));
    setChecked(false);
  };

  /** Picks a property without marking the form edited, e.g. the user's only one. */
  const preselectProperty = (propertyId: string) => {
    form.reset({ ...form.getValues(), propertyId }, { keepDefaultValues: false });
  };

  /** Turns on error display; true when everything is valid. */
  const check = () => {
    setChecked(true);
    return !hasErrors(validateEntry(form.getValues(), context));
  };

  const payload = (receiptId: string | null) =>
    toCreateTransactionPayload(
      { ...form.getValues(), receiptId },
      { units: units.map((unit) => ({ id: unit.id, rentDue: unit.rentDue })), category },
    );

  return {
    values,
    errors,
    isDirty: form.formState.isDirty,
    units,
    unitsLoading: values.propertyId !== null && property.isPending,
    categories: categories.data ?? [],
    categoriesLoading: categories.isPending,
    category,
    set,
    setKind,
    setProperty,
    toggleUnit,
    setSplitMode,
    setPercent,
    resetSplit,
    setCategory,
    reset,
    preselectProperty,
    check,
    payload,
  };
}

type NewEntryForm = ReturnType<typeof useNewEntryForm>;

export { type NewEntryForm, type NewEntryOptions, useNewEntryForm, WHOLE_BUILDING };
