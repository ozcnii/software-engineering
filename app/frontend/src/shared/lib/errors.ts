import { ApiClientError } from '../api/client';

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}
