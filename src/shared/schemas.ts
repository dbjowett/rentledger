import { sumBy } from 'es-toolkit';
import { z } from 'zod';

import { isDateWithinMonthsAhead, isIsoDate, isMonthStart, isWithinMonthsAhead } from './dates';
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

const ENTRY_KINDS = ['expense', 'income'] as const;

/** $10,000,000, in cents. */
const MAX_AMOUNT_CENTS = 1_000_000_000;

const FULL_SHARE_BASIS_POINTS = 10_000;

const splitShare = z.object({
  unit_id: z.uuid(),
  basis_points: z.number().int().min(1).max(FULL_SHARE_BASIS_POINTS),
});

/** Where the money belongs: the whole building, one unit, or a split across 2+ units. */
const entryTarget = z.discriminatedUnion('type', [
  z.object({ type: z.literal('building') }),
  z.object({ type: z.literal('unit'), unit_id: z.uuid() }),
  z.object({
    type: z.literal('split'),
    mode: z.enum(['even', 'custom']),
    units: z.array(splitShare).min(2, 'Pick at least two units to split'),
  }),
]);

const entryDate = z
  .string()
  .refine(isIsoDate, 'Pick a date')
  .refine(
    (value) => isDateWithinMonthsAhead(value, MAX_MONTHS_AHEAD, SERVER_TIME_ZONE),
    'Pick a date within the next year',
  );

const createTransactionBody = z
  .object({
    kind: z.enum(ENTRY_KINDS),
    amount_cents: z
      .number()
      .int()
      .positive('Enter an amount above $0')
      .max(MAX_AMOUNT_CENTS, 'Enter an amount up to $10,000,000'),
    property_id: z.uuid(),
    target: entryTarget,
    category_id: z.uuid(),
    date: entryDate,
    is_capital: z.boolean().default(false),
    note: z.string().trim().max(500).optional(),
    repeat_monthly: z.boolean().default(false),
    receipt_id: z.uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === 'income' && value.is_capital) {
      ctx.addIssue({
        code: 'custom',
        path: ['is_capital'],
        message: 'Only expenses can be capital improvements',
      });
    }
    if (value.target.type !== 'split') return;
    if (value.kind === 'income') {
      ctx.addIssue({ code: 'custom', path: ['target'], message: 'Income goes to one unit' });
    }
    const total = sumBy(value.target.units, (unit) => unit.basis_points);
    if (total !== FULL_SHARE_BASIS_POINTS) {
      ctx.addIssue({
        code: 'custom',
        path: ['target', 'units'],
        message: 'Split must add up to 100%',
      });
    }
    const unitIds = new Set(value.target.units.map((unit) => unit.unit_id));
    if (unitIds.size !== value.target.units.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['target', 'units'],
        message: 'Each unit can only appear once in a split',
      });
    }
  });

/** 15 MB, the receipts bucket's limit. */
const MAX_RECEIPT_BYTES = 15_000_000;

const RECEIPT_MIME_TYPES = ['image/jpeg', 'application/pdf'] as const;

const receiptUploadBody = z.object({
  mime_type: z.enum(RECEIPT_MIME_TYPES),
  size_bytes: z.number().int().positive().max(MAX_RECEIPT_BYTES, 'Receipts can be up to 15 MB'),
  original_file_name: z.string().trim().max(255).optional(),
});

const entryKindQuery = z.enum(ENTRY_KINDS).optional();

const MAX_ENTRY_PAGE = 200;

const entryListQuery = z.object({
  property_id: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_ENTRY_PAGE).default(100),
});

type RentDueBody = z.infer<typeof rentDue>;
type UnitBody = z.input<typeof unitBody>;
type CreatePropertyBody = z.input<typeof createPropertyBody>;
type EntryKind = (typeof ENTRY_KINDS)[number];
type EntryTargetBody = z.infer<typeof entryTarget>;
type CreateTransactionBody = z.input<typeof createTransactionBody>;
type ReceiptMimeType = (typeof RECEIPT_MIME_TYPES)[number];
type ReceiptUploadBody = z.input<typeof receiptUploadBody>;

export {
  createTransactionBody,
  type CreateTransactionBody,
  ENTRY_KINDS,
  type EntryKind,
  entryKindQuery,
  entryListQuery,
  entryTarget,
  type EntryTargetBody,
  FULL_SHARE_BASIS_POINTS,
  MAX_AMOUNT_CENTS,
  MAX_RECEIPT_BYTES,
  RECEIPT_MIME_TYPES,
  type ReceiptMimeType,
  receiptUploadBody,
  type ReceiptUploadBody,
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
