import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError } from '@/server/http';

const BUCKET = 'receipts';

const receiptId = z.uuid();

/** Removes a receipt that isn't attached to an entry yet, and its file. */
async function DELETE(request: Request, params: Record<string, string>): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const id = receiptId.safeParse(params.id);
  if (!id.success) return apiError(404, 'not_found', 'Receipt not found');

  const { data: receipt, error } = await auth.supabase
    .from('receipts')
    .select('id, file_key, transaction_id')
    .eq('id', id.data)
    .maybeSingle();
  if (error !== null) return apiError(500, 'internal', error.message);
  if (receipt === null) return apiError(404, 'not_found', 'Receipt not found');
  if (receipt.transaction_id !== null) {
    return apiError(409, 'conflict', 'This receipt belongs to a saved entry');
  }

  const { error: storageError } = await auth.supabase.storage
    .from(BUCKET)
    .remove([receipt.file_key]);
  if (storageError !== null) return apiError(500, 'internal', storageError.message);

  const { error: deleteError } = await auth.supabase.from('receipts').delete().eq('id', receipt.id);
  if (deleteError !== null) return apiError(500, 'internal', deleteError.message);

  return new Response(null, { status: 204 });
}

export { DELETE };
