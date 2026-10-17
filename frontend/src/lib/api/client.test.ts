import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './client';

afterEach(() => vi.unstubAllGlobals());

describe('api errors', () => {
  it('preserves server validation field errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Validation failed', errors: { fieldErrors: { name: ['Required'] } } }), { status: 400, headers: { 'Content-Type': 'application/json' } })));
    await expect(api('/campaigns')).rejects.toMatchObject<ApiError>({ status: 400, fieldErrors: { name: ['Required'] } });
  });

  it('turns network failures into a useful error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(api('/campaigns')).rejects.toMatchObject<ApiError>({ status: 0, message: expect.stringContaining('Unable to reach') });
  });
});
