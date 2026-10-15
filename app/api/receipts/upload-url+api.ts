import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, databaseError, json, readJson } from '@/server/http';
import { receiptUploadBody, type ReceiptMimeType } from '@/shared/schemas';
import type { ReceiptUploadResponse } from '@/shared/types';

const BUCKET = 'receipts';

const extensions: Record<ReceiptMimeType, string> = {
  'image/jpeg': 'jpg',
  'application/pdf': 'pdf',
};

/**
 * Registers an unattached receipt and returns a one-time upload URL for it. The device uploads
 * the file straight to Storage, so file bytes never pass through this route.
 */
async function POST(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const parsed = receiptUploadBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, 'invalid_body', 'Invalid receipt', z.flattenError(parsed.error));
  }

  const { mime_type, size_bytes, original_file_name } = parsed.data;
  const id = crypto.randomUUID();
  const path = `${auth.user.id}/${new Date().getUTCFullYear()}/${id}.${extensions[mime_type]}`;

  const { error } = await auth.supabase.from('receipts').insert({
    id,
    file_key: path,
    mime_type,
    size_bytes,
    original_file_name: original_file_name === '' ? null : original_file_name,
  });
  if (error !== null) return databaseError(error);

  const { data, error: signError } = await auth.supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (signError !== null) {
    await auth.supabase.from('receipts').delete().eq('id', id);
    return apiError(500, 'internal', signError.message);
  }

  const result: ReceiptUploadResponse = { receipt_id: id, path: data.path, token: data.token };
  return json(result, 201);
}

export { POST };
