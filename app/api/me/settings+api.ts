import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, json, readJson } from '@/server/http';
import { updateSettingsInput } from '@/shared/schemas';
import type { UpdateSettingsResult } from '@/shared/types';

export async function PATCH(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const parsed = updateSettingsInput.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, 'invalid_body', 'Invalid settings', z.flattenError(parsed.error));
  }

  const { timeZone, onlyIfUnset } = parsed.data;

  let query = auth.supabase
    .from('user_settings')
    .update({ time_zone: timeZone })
    .eq('user_id', auth.user.id);
  if (onlyIfUnset) query = query.or('time_zone.is.null,time_zone.eq.');

  const { data: updated, error } = await query.select().maybeSingle();
  if (error !== null) return apiError(500, 'internal', error.message);

  if (updated !== null) {
    const result: UpdateSettingsResult = { settings: updated, updated: true };
    return json(result);
  }

  const { data: current, error: readError } = await auth.supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (readError !== null) return apiError(500, 'internal', readError.message);
  if (current === null) return apiError(404, 'not_found', 'Settings not found');

  const result: UpdateSettingsResult = { settings: current, updated: false };
  return json(result);
}
