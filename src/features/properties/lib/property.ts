import type { CreatePropertyInput } from '@/shared/types';

import type { UnitFormValues } from './units';

/** The whole add-property form. */
type PropertyFormValues = {
  address: string;
  name: string;
  /** True once the user edits the name; until then it follows the address. */
  nameTouched: boolean;
  /** Null while the field is empty. */
  ownershipPct: number | null;
  units: UnitFormValues[];
};

type CreateUnitInput = CreatePropertyInput['units'][number];

const DEFAULT_OWNERSHIP_PCT = 100;

/**
 * The property's default name: the address up to the first comma.
 * @example nameFromAddress('123 Cedar Row, Toronto ON') // '123 Cedar Row'
 * @example nameFromAddress('  ') // ''
 */
function nameFromAddress(address: string): string {
  return (address.split(',')[0] ?? '').trim();
}

function toCreateUnitInput(unit: UnitFormValues): CreateUnitInput {
  const label = unit.label.trim();
  if (unit.status === 'occupied') {
    const tenantName = unit.tenantName.trim();
    return {
      status: 'occupied',
      label,
      rentCents: unit.rentCents ?? 0,
      rentDue: unit.rentDue,
      rentStartDate: unit.rentStartDate,
      ...(tenantName === '' ? {} : { tenantName }),
    };
  }
  if (unit.status === 'vacant') {
    return {
      status: 'vacant',
      label,
      ...(unit.rentCents === null ? {} : { rentCents: unit.rentCents }),
    };
  }
  return { status: 'owner_occupied', label };
}

/**
 * Turns validated form values into the API input, sending only the fields each unit's status
 * allows (no rent or tenant for "I live here", no due day for vacant units).
 */
function toCreatePropertyPayload(values: PropertyFormValues): CreatePropertyInput {
  return {
    address: values.address.trim(),
    name: values.name.trim(),
    ownershipPct: values.ownershipPct ?? DEFAULT_OWNERSHIP_PCT,
    units: values.units.map((unit) => toCreateUnitInput(unit)),
  };
}

export { DEFAULT_OWNERSHIP_PCT, type PropertyFormValues, nameFromAddress, toCreatePropertyPayload };
