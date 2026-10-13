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

async function readJson(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return undefined;
  }
}

export { apiError, json, readJson };
