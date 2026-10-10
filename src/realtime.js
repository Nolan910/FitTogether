import { io } from 'socket.io-client';

export const createSocket = (token) => io(import.meta.env.VITE_API_URL, {
  auth: { token },
});
