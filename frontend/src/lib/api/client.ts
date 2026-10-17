import { apiBasePath } from '@/lib/env';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBasePath}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new ApiError('Unable to reach the service. Check your connection and try again.', 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors = body?.errors?.fieldErrors && typeof body.errors.fieldErrors === 'object'
      ? body.errors.fieldErrors as Record<string, string[]>
      : undefined;
    throw new ApiError(body.message || 'Request failed', response.status, fieldErrors);
  }
  return body as T;
}
