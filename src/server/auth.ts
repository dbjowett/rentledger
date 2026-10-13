import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

import type { Database } from '@/shared/database.types';

import { apiError } from './http';

type AuthResult =
  | { ok: true; supabase: SupabaseClient<Database>; user: User }
  | { ok: false; response: Response };

/** Verifies the bearer token and returns a Supabase client acting as that user (RLS applies). */
async function requireUser(request: Request): Promise<AuthResult> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (url === undefined || url === '' || anonKey === undefined || anonKey === '') {
    return {
      ok: false,
      response: apiError(500, 'internal', 'Server is missing SUPABASE_URL or SUPABASE_ANON_KEY'),
    };
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token === undefined || token === '') {
    return { ok: false, response: apiError(401, 'unauthorized', 'Missing token') };
  }

  const supabase = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error !== null) {
    return { ok: false, response: apiError(401, 'unauthorized', 'Invalid session') };
  }

  return { ok: true, supabase, user: data.user };
}

export { requireUser };
