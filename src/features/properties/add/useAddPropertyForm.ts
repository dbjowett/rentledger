import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { addMonthsTo, currentMonthStart } from '@/shared/dates';
import { MAX_MONTHS_AHEAD } from '@/shared/schemas';

import { DEFAULT_OWNERSHIP_PCT, nameFromAddress, type PropertyFormValues } from '../lib/property';
import { createUnitFormValues, resizeUnits, type UnitFormValues } from '../lib/units';
import { createPropertyFormSchema, type Step, STEP_FIELDS, STEPS } from './formSchema';

type ApplyToAllField = 'rentDue' | 'rentStartDate';

function copyField(
  unit: UnitFormValues,
  source: UnitFormValues,
  field: ApplyToAllField,
): UnitFormValues {
  return field === 'rentDue'
    ? { ...unit, rentDue: source.rentDue }
    : { ...unit, rentStartDate: source.rentStartDate };
}

/**
 * State for the add-property flow: one react-hook-form form across all steps, the current step,
 * and setters that keep the derived rules (name follows the address until edited, unit labels
 * follow the unit count until renamed).
 *
 * Errors only appear after a step's "Next" was pressed once; from then on that step re-checks on
 * every change so errors clear as soon as they're fixed.
 */
function useAddPropertyForm(timeZone: string) {
  const schema = useMemo(() => createPropertyFormSchema(timeZone), [timeZone]);
  const monthStart = useMemo(() => currentMonthStart(timeZone), [timeZone]);
  const maxMonth = useMemo(() => addMonthsTo(monthStart, MAX_MONTHS_AHEAD), [monthStart]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: '',
      name: '',
      nameTouched: false,
      ownershipPct: DEFAULT_OWNERSHIP_PCT,
      units: [createUnitFormValues(0, 1, monthStart)],
    },
    mode: 'onSubmit',
  });

  const [step, setStep] = useState<Step>('property');
  const [checkedSteps, setCheckedSteps] = useState<ReadonlySet<Step>>(() => new Set());
  const values = form.watch();
  const stepIndex = STEPS.indexOf(step);

  const recheck = () => {
    if (checkedSteps.has(step)) void form.trigger([...STEP_FIELDS[step]]);
  };

  const options = { shouldDirty: true } as const;

  const setAddress = (address: string) => {
    form.setValue('address', address, options);
    if (!form.getValues('nameTouched')) form.setValue('name', nameFromAddress(address), options);
    recheck();
  };

  /** Editing the name stops it following the address; clearing it lets it follow again. */
  const setName = (name: string) => {
    form.setValue('name', name, options);
    form.setValue('nameTouched', name !== '', options);
    recheck();
  };

  const setOwnershipPct = (ownershipPct: number | null) => {
    form.setValue('ownershipPct', ownershipPct, options);
    recheck();
  };

  const setUnitCount = (count: number) => {
    form.setValue('units', resizeUnits(form.getValues('units'), count, monthStart), options);
    recheck();
  };

  const updateUnit = (index: number, patch: Partial<UnitFormValues>) => {
    const units = form.getValues('units');
    const current = units[index];
    if (current === undefined) return;
    form.setValue('units', units.with(index, { ...current, ...patch }), options);
    recheck();
  };

  /** Copies the first unit's due day or start month to every occupied unit. */
  const applyToAll = (field: ApplyToAllField) => {
    const units = form.getValues('units');
    const source = units[0];
    if (source === undefined) return;
    const next = units.map((unit) =>
      unit.status === 'occupied' ? copyField(unit, source, field) : unit,
    );
    form.setValue('units', next, options);
    recheck();
  };

  /** Validates the current step; moves on when it passes. Returns whether it passed. */
  const next = async () => {
    setCheckedSteps((current) => new Set(current).add(step));
    const valid = await form.trigger([...STEP_FIELDS[step]]);
    const following = STEPS[stepIndex + 1];
    if (valid && following !== undefined) setStep(following);
    return valid;
  };

  const back = () => {
    const previous = STEPS[stepIndex - 1];
    if (previous !== undefined) setStep(previous);
  };

  return {
    form,
    values,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    step,
    stepIndex,
    maxMonth,
    goTo: setStep,
    next,
    back,
    setAddress,
    setName,
    setOwnershipPct,
    setUnitCount,
    updateUnit,
    applyToAll,
  };
}

type AddPropertyForm = ReturnType<typeof useAddPropertyForm>;

export { type AddPropertyForm, type ApplyToAllField, useAddPropertyForm };
