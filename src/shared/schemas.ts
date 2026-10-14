import { z } from 'zod';

import { isMonthStart, isWithinMonthsAhead } from './dates';
import { isValidTimeZone } from './timeZones';

const timeZone = z.string().trim().refine(isValidTimeZone, 'Unknown time zone');

const updateSettingsBody = z.object({
  time_zone: timeZone,
  /** Only write when no time zone is stored yet (used for the device value at sign-in). */
  only_if_unset: z.boolean().default(false),
});

type UpdateSettingsBody = z.input<typeof updateSettingsBody>;

/** Rent is due on a fixed day 1–28, or on the last day of each month (28th–31st). */
const rentDue = z.discriminatedUnion('type', [
  z.object({ type: z.literal('day'), day: z.number().int().min(1).max(28) }),
  z.object({ type: z.literal('last') }),
]);

const MAX_MONTHS_AHEAD = 12;

/** The API doesn't know the user's time zone; UTC is at or ahead of every Canadian zone, so it never rejects a valid month. */
const SERVER_TIME_ZONE = 'UTC';

const unitLabel = z.string().trim().min(1, 'Give this unit a name').max(40);

/** First day of a month, `YYYY-MM-01`, at most a year ahead. */
const rentStartDate = z
  .string()
  .refine(isMonthStart, 'Pick a month')
  .refine(
    (value) => isWithinMonthsAhead(value, MAX_MONTHS_AHEAD, SERVER_TIME_ZONE),
    'Pick a month within the next year',
  );

const unitBody = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('occupied'),
    label: unitLabel,
    rent_cents: z.number().int().positive('Enter the monthly rent'),
    rent_due: rentDue,
    rent_start_date: rentStartDate,
    tenant_name: z.string().trim().max(80).optional(),
  }),
  z.object({
    status: z.literal('vacant'),
    label: unitLabel,
    rent_cents: z.number().int().min(0).optional(),
  }),
  z.object({
    status: z.literal('owner_occupied'),
    label: unitLabel,
  }),
]);

const MAX_UNITS = 50;

const propertyBody = z.object({
  address: z.string().trim().min(1, "Enter the property's address").max(200),
  name: z.string().trim().min(1, 'Give the property a name').max(80),
  ownership_pct: z.number().min(0.01).max(100).default(100),
  units: z.array(unitBody).min(1).max(MAX_UNITS),
});

const createPropertyBody = propertyBody.superRefine((value, ctx) => {
  if (!value.units.some((unit) => unit.status !== 'owner_occupied')) {
    ctx.addIssue({
      code: 'custom',
      path: ['units'],
      message: 'At least one unit has to be rented or vacant.',
    });
  }
  if (value.units.length === 1 && value.units[0]?.status === 'owner_occupied') {
    ctx.addIssue({
      code: 'custom',
      path: ['units', 0, 'status'],
      message: "A single-unit property can't be owner-occupied.",
    });
  }
  const seen = new Set<string>();
  for (const [index, unit] of value.units.entries()) {
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

type RentDueBody = z.infer<typeof rentDue>;
type UnitBody = z.input<typeof unitBody>;
type CreatePropertyBody = z.input<typeof createPropertyBody>;

export {
  MAX_MONTHS_AHEAD,
  type CreatePropertyBody,
  type RentDueBody,
  type UnitBody,
  type UpdateSettingsBody,
  createPropertyBody,
  MAX_UNITS,
  propertyBody,
  rentDue,
  unitBody,
  updateSettingsBody,
};
