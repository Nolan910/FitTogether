import { vi } from 'vitest';

const base64Url = (value) => btoa(JSON.stringify(value))
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

export const makeToken = (secondsFromNow = 3600) => [
  base64Url({ alg: 'HS256', typ: 'JWT' }),
  base64Url({ userId: 'user-1', exp: Math.floor(Date.now() / 1000) + secondsFromNow }),
  'signature',
].join('.');

export const TEST_USER = { _id: 'user-1', name: 'Alice', profilPic: '/alice.png' };

export const storeSession = (token = makeToken(), user = TEST_USER) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

export const mockFetch = (...responses) => {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};
