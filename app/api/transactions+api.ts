import { sortBy } from 'es-toolkit';
import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, databaseError, json, readJson } from '@/server/http';
import {
  ENTRY_KINDS,
  createTransactionBody,
  entryListQuery,
  type EntryKind,
} from '@/shared/schemas';
import type {
  EntryListItemResponse,
  EntryPlacementResponse,
  TransactionResponse,
} from '@/shared/types';

function isEntryKind(value: string): value is EntryKind {
  return ENTRY_KINDS.some((kind) => kind === value);
}

// Units and properties are also reachable through transaction_splits and receipts, so the
// direct links are named explicitly; otherwise PostgREST rejects the embed as ambiguous.
const ENTRY_LIST_SELECT = `
  id, kind, amount_cents, date, note, is_capital, recurring_rule_id, unit_id,
  properties!transactions_property_id_fkey(id, name, units(count)),
  units!transactions_unit_id_fkey(label),
  categories(key, name),
  transaction_splits(units(label, sort_order)),
  receipts(id)
`;

type SplitUnit = { units: { label: string; sort_order: number } | null };

function placementOf(
  unitId: string | null,
  unitLabel: string | null,
  propertyUnitCount: number,
  splits: readonly SplitUnit[],
): EntryPlacementResponse {
  if (splits.length >= 2) {
    const units = sortBy(
      splits.flatMap((split) => (split.units === null ? [] : [split.units])),
      [(unit) => unit.sort_order],
    );
    return { type: 'split', unit_labels: units.map((unit) => unit.label) };
  }
  if (unitId === null) return { type: 'building' };
  if (propertyUnitCount <= 1 || unitLabel === null) return { type: 'property' };
  return { type: 'unit', unit_label: unitLabel };
}

/** Confirmed entries, newest first, optionally for one property. */
async function GET(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const params = new URL(request.url).searchParams;
  const parsed = entryListQuery.safeParse({
    property_id: params.get('property_id') ?? undefined,
    limit: params.get('limit') ?? undefined,
  });
  if (!parsed.success) {
    return apiError(400, 'invalid_body', 'Invalid filters', z.flattenError(parsed.error));
  }

  let query = auth.supabase
    .from('transactions')
    .select(ENTRY_LIST_SELECT)
    .eq('status', 'confirmed')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(parsed.data.limit);
  if (parsed.data.property_id !== undefined) {
    query = query.eq('property_id', parsed.data.property_id);
  }

  const { data, error } = await query;
  if (error !== null) return apiError(500, 'internal', error.message);

  const entries: EntryListItemResponse[] = data.flatMap((row) => {
    if (row.properties === null || row.categories === null) return [];
    return [
      {
        id: row.id,
        kind: isEntryKind(row.kind) ? row.kind : 'expense',
        amount_cents: row.amount_cents,
        date: row.date,
        note: row.note,
        is_capital: row.is_capital,
        is_recurring: row.recurring_rule_id !== null,
        has_receipt: row.receipts.length > 0,
        property: { id: row.properties.id, name: row.properties.name },
        category: { key: row.categories.key, name: row.categories.name },
        placement: placementOf(
          row.unit_id,
          row.units?.label ?? null,
          row.properties.units[0]?.count ?? 0,
          row.transaction_splits,
        ),
      },
    ];
  });
  return json(entries);
}

/** Saves one confirmed entry (with its split, repeat rule and receipt) in a single transaction. */
async function POST(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const parsed = createTransactionBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, 'invalid_body', 'Invalid entry', z.flattenError(parsed.error));
  }

  const { data: id, error } = await auth.supabase.rpc('create_transaction', { p: parsed.data });
  if (error !== null) return databaseError(error);

  const { data, error: readError } = await auth.supabase
    .from('transactions')
    .select('*, transaction_splits(unit_id, basis_points, amount_cents)')
    .eq('id', id)
    .single();
  if (readError !== null) return apiError(500, 'internal', readError.message);

  const { transaction_splits: splits, user_id: _userId, kind, ...transaction } = data;
  const result: TransactionResponse = {
    ...transaction,
    kind: isEntryKind(kind) ? kind : 'expense',
    splits,
  };
  return json(result, 201);
}

export { GET, POST };
