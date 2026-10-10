import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createdSockets, createFakeSocket } from './fakeSocket';

vi.mock('../realtime', () => ({
  createSocket: (token) => createFakeSocket(token),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  createdSockets.length = 0;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
