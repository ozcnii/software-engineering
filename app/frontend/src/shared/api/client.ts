import type { ApiErrorPayload } from '@labyrinth/shared/types/api';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = payload.code;
    this.fields = payload.fields ?? {};
  }
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:13001').replace(
  /\/$/,
  '',
);

type RequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data: unknown = text.length > 0 ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const payload = isApiErrorResponse(data)
      ? data.error
      : {
          code: 'REQUEST_FAILED',
          message: 'Запрос не выполнен',
        };

    throw new ApiClientError(response.status, payload);
  }

  return data as T;
}

function isApiErrorResponse(value: unknown): value is { error: ApiErrorPayload } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error?: unknown }).error === 'object' &&
    (value as { error: { message?: unknown; code?: unknown } }).error !== null &&
    typeof (value as { error: { message?: unknown } }).error.message === 'string' &&
    typeof (value as { error: { code?: unknown } }).error.code === 'string'
  );
}
