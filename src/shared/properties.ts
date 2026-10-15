import { sortBy, sumBy } from 'es-toolkit';

import type {
  PropertyResponse,
  PropertyRow,
  PropertySummaryResponse,
  RentDue,
  UnitResponse,
  UnitRow,
  UnitStatus,
} from './types';

const UNIT_STATUSES: readonly UnitStatus[] = ['occupied', 'vacant', 'owner_occupied'];

function isUnitStatus(value: string): value is UnitStatus {
  return UNIT_STATUSES.some((status) => status === value);
}

/** The database stores the due day as two columns; the API speaks one RentDue. */
function unitRowToRentDue(
  row: Pick<UnitRow, 'rent_due_day' | 'rent_due_last_day'>,
): RentDue | null {
  if (row.rent_due_last_day) return { type: 'last' };
  if (row.rent_due_day !== null) return { type: 'day', day: row.rent_due_day };
  return null;
}

function toUnitResponse(row: UnitRow): UnitResponse {
  return {
    id: row.id,
    label: row.label,
    status: isUnitStatus(row.status) ? row.status : 'vacant',
    rent_cents: row.rent_cents,
    rent_due: unitRowToRentDue(row),
    rent_start_date: row.rent_start_date,
    tenant_name: row.tenant_name,
    sort_order: row.sort_order,
  };
}

function withoutUserId(row: PropertyRow): Omit<PropertyRow, 'user_id'> {
  const { user_id: _userId, ...property } = row;
  return property;
}

function toPropertyResponse(row: PropertyRow, units: UnitRow[]): PropertyResponse {
  return {
    ...withoutUserId(row),
    units: sortBy(units, [(unit) => unit.sort_order]).map((unit) => toUnitResponse(unit)),
  };
}

function toPropertySummaryResponse(
  row: PropertyRow,
  units: Array<Pick<UnitRow, 'status' | 'rent_cents'>>,
): PropertySummaryResponse {
  const count = (status: UnitStatus) => units.filter((unit) => unit.status === status).length;
  return {
    ...withoutUserId(row),
    unit_count: units.length,
    occupied_count: count('occupied'),
    vacant_count: count('vacant'),
    owner_occupied_count: count('owner_occupied'),
    monthly_rent_cents: sumBy(
      units.filter((unit) => unit.status === 'occupied'),
      (unit) => unit.rent_cents ?? 0,
    ),
  };
}

export {
  isUnitStatus,
  toPropertyResponse,
  toPropertySummaryResponse,
  toUnitResponse,
  unitRowToRentDue,
};
