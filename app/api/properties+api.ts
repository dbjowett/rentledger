import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, databaseError, json, readJson } from '@/server/http';
import { toPropertySummaryResponse } from '@/shared/properties';
import { createPropertyBody } from '@/shared/schemas';
import type { CreatePropertyResponse, PropertySummaryResponse } from '@/shared/types';

async function GET(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from('properties')
    .select('*, units(status, rent_cents)')
    .order('created_at');
  if (error !== null) return apiError(500, 'internal', error.message);

  const properties: PropertySummaryResponse[] = data.map(({ units, ...row }) =>
    toPropertySummaryResponse(row, units),
  );
  return json(properties);
}

async function POST(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const parsed = createPropertyBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, 'invalid_body', 'Invalid property', z.flattenError(parsed.error));
  }

  const { name, address, ownership_pct, units } = parsed.data;
  const { data: id, error } = await auth.supabase.rpc('create_property', {
    p_name: name,
    p_address: address,
    p_ownership_pct: ownership_pct,
    p_units: units,
  });
  if (error !== null) return databaseError(error, 'Each unit needs a different name');

  const result: CreatePropertyResponse = { id };
  return json(result, 201);
}

export { GET, POST };
