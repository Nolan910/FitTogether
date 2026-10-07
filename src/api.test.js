import { describe, expect, test, vi, afterEach } from 'vitest';
import { api, ApiError, setUnauthorizedHandler } from './api';
import { jsonResponse, mockFetch } from './test/utils';

afterEach(() => {
  setUnauthorizedHandler(null);
});

describe('api', () => {
  test("ajoute l'URL de l'API, le token et le JSON", async () => {
    localStorage.setItem('token', 'mon-token');
    const fetchMock = mockFetch(jsonResponse(200, { ok: true }));

    const data = await api('/messages', { method: 'POST', body: { content: 'Salut' } });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer mon-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Salut' }),
    });
  });

  test('envoie un FormData tel quel, sans Content-Type', async () => {
    const fetchMock = mockFetch(jsonResponse(201, {}));
    const formData = new FormData();

    await api('/createPoste', { method: 'POST', body: formData });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBe(formData);
    expect(options.headers).toEqual({});
  });

  test('déconnecte l’utilisateur quand l’API répond 401', async () => {
    localStorage.setItem('token', 'token-expire');
    mockFetch(jsonResponse(401, { message: 'Session invalide ou expirée.' }));
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    const call = api('/user/1/partner-requests');

    await expect(call).rejects.toThrow(new ApiError('Session invalide ou expirée.', 401));
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  test("ne déconnecte pas sur un 401 sans token (mauvais mot de passe)", async () => {
    mockFetch(jsonResponse(401, { message: 'Email ou mot de passe incorrect.' }));
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api('/login', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('transforme une coupure réseau en message lisible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(api('/posts')).rejects.toMatchObject({
      message: 'Erreur réseau. Veuillez réessayer.',
      status: 0,
    });
  });
});
