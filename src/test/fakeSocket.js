import { vi } from 'vitest';

export const createdSockets = [];

export const createFakeSocket = (token) => {
  const handlers = {};
  const socket = {
    token,
    connected: true,
    on: vi.fn((event, handler) => {
      (handlers[event] ||= new Set()).add(handler);
      return socket;
    }),
    off: vi.fn((event, handler) => {
      handlers[event]?.delete(handler);
      return socket;
    }),
    disconnect: vi.fn(() => {
      socket.connected = false;
    }),
    serverEmit: (event, payload) => {
      handlers[event]?.forEach((handler) => handler(payload));
    },
  };
  createdSockets.push(socket);
  return socket;
};

export const lastSocket = () => createdSockets[createdSockets.length - 1];
