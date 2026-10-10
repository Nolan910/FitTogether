import { describe, expect, test, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import Chat from './Chat';
import { jsonResponse, storeSession } from '../test/utils';
import { lastSocket } from '../test/fakeSocket';

const BOB = { _id: 'user-2', name: 'Bob' };
const CAROL = { _id: 'user-3', name: 'Carol' };

const mockApi = () => {
  const fetchMock = vi.fn((url, options = {}) => {
    const path = url.replace('http://api.test', '');
    if (path === '/user/user-1/partners') return Promise.resolve(jsonResponse(200, [BOB, CAROL]));
    if (path === '/messages/user-2') {
      return Promise.resolve(jsonResponse(200, [{ _id: 'm1', from: 'user-2', to: 'user-1', content: 'Salut Alice' }]));
    }
    if (path === '/messages/user-3') return Promise.resolve(jsonResponse(200, []));
    if (path === '/messages' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve(jsonResponse(201, { _id: 'm-envoye', from: 'user-1', ...body }));
    }
    return Promise.resolve(jsonResponse(404, {}));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const renderChat = () => render(
  <MemoryRouter>
    <AuthProvider>
      <Chat />
    </AuthProvider>
  </MemoryRouter>
);

const openConversation = async (user, name) => {
  await user.click(await screen.findByRole('button', { name: new RegExp(`^${name}`) }));
  return screen.findByRole('log');
};

describe('Messagerie en temps réel', () => {
  test('ouvre une connexion WebSocket avec le token de la session', async () => {
    storeSession();
    mockApi();
    renderChat();

    await screen.findByRole('button', { name: /^Bob/ });
    expect(lastSocket().token).toBe(localStorage.getItem('token'));
  });

  test('affiche un message reçu sans recharger la page', async () => {
    storeSession();
    mockApi();
    const user = userEvent.setup();
    renderChat();
    const log = await openConversation(user, 'Bob');
    await within(log).findByText('Salut Alice');

    act(() => {
      lastSocket().serverEmit('message:new', { _id: 'm2', from: 'user-2', to: 'user-1', content: 'On court demain ?' });
    });

    expect(within(log).getByText('On court demain ?')).toBeInTheDocument();
  });

  test('n’affiche pas deux fois le message envoyé (réponse HTTP et WebSocket)', async () => {
    storeSession();
    mockApi();
    const user = userEvent.setup();
    renderChat();
    const log = await openConversation(user, 'Bob');

    await user.type(screen.getByLabelText('Votre message à Bob'), 'Avec plaisir');
    await user.click(screen.getByRole('button', { name: 'Envoyer' }));
    await within(log).findByText('Avec plaisir');
    act(() => {
      lastSocket().serverEmit('message:new', { _id: 'm-envoye', from: 'user-1', to: 'user-2', content: 'Avec plaisir' });
    });

    expect(within(log).getAllByText('Avec plaisir')).toHaveLength(1);
  });

  test('signale un nouveau message d’un autre partenaire sans l’ajouter à la conversation ouverte', async () => {
    storeSession();
    mockApi();
    const user = userEvent.setup();
    renderChat();
    const log = await openConversation(user, 'Bob');
    await within(log).findByText('Salut Alice');

    act(() => {
      lastSocket().serverEmit('message:new', { _id: 'm3', from: 'user-3', to: 'user-1', content: 'Coucou' });
    });

    expect(within(log).queryByText('Coucou')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Carol (nouveau message)' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Carol (nouveau message)' }));
    expect(screen.getByRole('button', { name: 'Carol' })).toBeInTheDocument();
  });

  test('recharge la conversation après une reconnexion', async () => {
    storeSession();
    const fetchMock = mockApi();
    const user = userEvent.setup();
    renderChat();
    await openConversation(user, 'Bob');
    const callsBefore = fetchMock.mock.calls.filter(([url]) => url.endsWith('/messages/user-2')).length;

    act(() => {
      lastSocket().serverEmit('connect');
    });

    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/messages/user-2')).length).toBe(callsBefore + 1);
  });

  test('ferme la connexion à la déconnexion', async () => {
    storeSession();
    mockApi();
    const { unmount } = renderChat();
    await screen.findByRole('button', { name: /^Bob/ });
    const socket = lastSocket();

    unmount();

    expect(socket.disconnect).toHaveBeenCalled();
  });
});
