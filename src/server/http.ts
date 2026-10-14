import type { ApiErrorCode } from '@/shared/types';

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): Response {
  return json({ error: { code, message, details } }, status);
}

type DatabaseError = { code: string; message: string };

/** Codes for input the database rejected: invalid value, bad text representation, unique and check violations. */
const INVALID_INPUT_CODES = new Set(['22023', '22P02', '23505', '23514']);

const UNIQUE_VIOLATION = '23505';

/** Maps a Postgres/PostgREST error to a 400 when the input was at fault, else a 500. */
function databaseError(error: DatabaseError, uniqueMessage = 'That already exists'): Response {
  if (!INVALID_INPUT_CODES.has(error.code)) return apiError(500, 'internal', error.message);
  const message = error.code === UNIQUE_VIOLATION ? uniqueMessage : error.message;
  return apiError(400, 'invalid_body', message);
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return undefined;
  }
}

export { apiError, databaseError, json, readJson };
