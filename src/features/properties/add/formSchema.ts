import { z } from 'zod';

import { isMonthStart, isWithinMonthsAhead } from '@/shared/dates';
import { MAX_MONTHS_AHEAD, MAX_UNITS } from '@/shared/schemas';

import type { PropertyFormValues } from '../lib/property';

/** Steps of the flow, in order. */
const STEPS = ['property', 'units', 'review'] as const;
type Step = (typeof STEPS)[number];

/** Form fields each step's "Next" validates. */
const STEP_FIELDS = {
  property: ['address', 'name', 'ownershipPct'],
  units: ['units'],
  review: [],
} as const satisfies Record<Step, ReadonlyArray<keyof PropertyFormValues>>;

/** Highest unit count the stepper offers; the API allows up to {@link MAX_UNITS}. */
const MAX_UNITS_IN_FORM = 20;

const rentDue = z.discriminatedUnion('type', [
  z.object({ type: z.literal('day'), day: z.number().int().min(1).max(28) }),
  z.object({ type: z.literal('last') }),
]);

function unitSchema(timeZone: string) {
  return z
    .object({
      label: z.string().trim().min(1, 'Give this unit a name').max(40),
      labelTouched: z.boolean(),
      status: z.enum(['occupied', 'vacant', 'owner_occupied']),
      rentCents: z.number().int().min(0).nullable(),
      tenantName: z.string().max(80),
      rentDue,
      rentStartDate: z.string(),
    })
    .superRefine((unit, ctx) => {
      if (unit.status !== 'occupied') return;
      if (unit.rentCents === null || unit.rentCents <= 0) {
        ctx.addIssue({ code: 'custom', path: ['rentCents'], message: 'Enter the monthly rent' });
      }
      if (!isMonthStart(unit.rentStartDate)) {
        ctx.addIssue({ code: 'custom', path: ['rentStartDate'], message: 'Pick a month' });
      } else if (!isWithinMonthsAhead(unit.rentStartDate, MAX_MONTHS_AHEAD, timeZone)) {
        ctx.addIssue({
          code: 'custom',
          path: ['rentStartDate'],
          message: 'Pick a month within the next year',
        });
      }
    });
}

/**
 * Validation for the add-property form, in the app's camelCase with messages for each field.
 * The API re-checks everything with `createPropertyBody`; this one exists for friendly errors.
 * @param timeZone The user's time zone, for the "within the next year" check.
 */
function createPropertyFormSchema(timeZone: string) {
  return z
    .object({
      address: z.string().trim().min(1, "Enter the property's address").max(200),
      name: z.string().trim().min(1, 'Give the property a name').max(80),
      nameTouched: z.boolean(),
      ownershipPct: z
        .number()
        .nullable()
        .refine(
          (value) => value !== null && value >= 0.01 && value <= 100,
          'Enter a share between 1 and 100%',
        ),
      units: z.array(unitSchema(timeZone)).min(1).max(MAX_UNITS),
    })
    .superRefine((values, ctx) => {
      if (!values.units.some((unit) => unit.status !== 'owner_occupied')) {
        ctx.addIssue({
          code: 'custom',
          path: ['units'],
          message: 'At least one unit has to be rented or vacant.',
        });
      }
      const seen = new Set<string>();
      for (const [index, unit] of values.units.entries()) {
        const key = unit.label.trim().toLowerCase();
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['units', index, 'label'],
            message: 'Each unit needs a different name',
          });
        }
        seen.add(key);
      }
    });
}

export { createPropertyFormSchema, MAX_UNITS_IN_FORM, type Step, STEP_FIELDS, STEPS };
