import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, databaseError, json, readJson } from '@/server/http';
import { ENTRY_KINDS, createTransactionBody, type EntryKind } from '@/shared/schemas';
import type { TransactionResponse } from '@/shared/types';

function isEntryKind(value: string): value is EntryKind {
  return ENTRY_KINDS.some((kind) => kind === value);
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

export { POST };
