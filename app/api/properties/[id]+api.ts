import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, json } from '@/server/http';
import { toPropertyResponse } from '@/shared/properties';

const propertyId = z.uuid();

export async function GET(request: Request, params: Record<string, string>): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const id = propertyId.safeParse(params.id);
  if (!id.success) return apiError(404, 'not_found', 'Property not found');

  const { data, error } = await auth.supabase
    .from('properties')
    .select('*, units(*)')
    .eq('id', id.data)
    .maybeSingle();
  if (error !== null) return apiError(500, 'internal', error.message);
  if (data === null) return apiError(404, 'not_found', 'Property not found');

  const { units, ...row } = data;
  return json(toPropertyResponse(row, units));
}
