import { snakeCase, toCamelCaseKeys, toSnakeCaseKeys } from 'es-toolkit';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { ApiError, Camel } from '@/shared/types';

type QueryValue = string | number | boolean | null | undefined;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** camelCase object; sent as snake_case JSON. */
  body?: object;
  /** camelCase keys; sent as snake_case search params. Null and undefined are skipped. */
  query?: Record<string, QueryValue>;
};

class ApiRequestError extends Error {
  readonly status: number;
  readonly body: Camel<ApiError> | null;

  constructor(status: number, body: Camel<ApiError> | null) {
    super(body?.error.message ?? `Request failed with status ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

function isApiError(value: unknown): value is Camel<ApiError> {
  return typeof value === 'object' && value !== null && 'error' in value;
}

function buildUrl(path: string, query: ApiOptions['query']) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) params.append(snakeCase(key), String(value));
  }
  const search = params.toString();
  return `${env.apiUrl}${path}${search === '' ? '' : `?${search}`}`;
}

/**
 * Calls our API with the session token. The server speaks snake_case and the app camelCase:
 * request bodies and query keys are converted to snake_case, responses to camelCase.
 * Pass the server's response type; the result is its camelCase version.
 */
async function api<TResponse>(
  path: string,
  { method = 'GET', body, query }: ApiOptions = {},
): Promise<Camel<TResponse>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers = new Headers({ Accept: 'application/json' });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (token !== undefined) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(toSnakeCaseKeys(body)),
  });
  const raw: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  const result: unknown = raw === null ? null : toCamelCaseKeys(raw);

  if (!response.ok) {
    if (response.status === 401) void supabase.auth.signOut();
    throw new ApiRequestError(response.status, isApiError(result) ? result : null);
  }

  // The API is ours and typed end to end; responses are trusted to match TResponse.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return result as Camel<TResponse>;
}

export { type ApiOptions, ApiRequestError, api };
