import { describe, it, expect, vi, afterEach } from 'vitest';
import { api, mediaUrl } from './api';
afterEach(() => vi.unstubAllGlobals());
describe('API client', () => {
  it('sends cookie credentials and JSON bodies', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { id: '1' } }) });
    vi.stubGlobal('fetch', fetch);
    expect(await api('/posts', { method: 'POST', body: { caption: 'Dog' } })).toEqual({ id: '1' });
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ caption: 'Dog' });
  });
  it('surfaces API errors and invalid server responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 401,
          json: async () => ({ success: false, message: 'Please log in' }),
        }),
    );
    await expect(api('/auth/me')).rejects.toMatchObject({ message: 'Please log in', status: 401 });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => {
          throw new Error();
        },
      }),
    );
    await expect(api('/posts')).rejects.toThrow('server is unavailable');
  });
  it('keeps image URLs usable', () => {
    expect(mediaUrl('/uploads/test.png')).toBe('/uploads/test.png');
    expect(mediaUrl('https://example.com/dog.png')).toBe('https://example.com/dog.png');
  });
});
