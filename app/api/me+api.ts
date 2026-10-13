import { requireUser } from '@/server/auth';
import { apiError, json } from '@/server/http';
import { getProfile } from '@/shared/profile';
import type { MeResponse } from '@/shared/types';

export async function GET(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { data: settings, error } = await auth.supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error !== null) return apiError(500, 'internal', error.message);
  if (settings === null) return apiError(404, 'not_found', 'Settings not found');

  const profile = getProfile(auth.user);
  const me: MeResponse = {
    id: auth.user.id,
    email: profile.email,
    name: profile.name,
    avatar_url: profile.avatarUrl,
    settings,
  };
  return json(me);
}
