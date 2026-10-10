import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import PublicProfile from './PublicProfile';
import { jsonResponse, storeSession } from '../test/utils';

const VIEWED = { _id: 'user-2', name: 'Bob', level: 'Débutant', location: 'Lyon' };

const mockApi = (relationship, overrides = {}) => {
  const fetchMock = vi.fn((url, options = {}) => {
    const path = url.replace('http://api.test', '');
    if (overrides[`${options.method || 'GET'} ${path}`]) return Promise.resolve(overrides[`${options.method || 'GET'} ${path}`]);
    if (path === '/user/user-2/relationship') return Promise.resolve(jsonResponse(200, { status: relationship }));
    if (path === '/user/user-2') return Promise.resolve(jsonResponse(200, VIEWED));
    if (path === '/user/user-2/posts') return Promise.resolve(jsonResponse(200, []));
    return Promise.resolve(jsonResponse(404, { message: 'introuvable' }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const renderProfile = () => render(
  <MemoryRouter initialEntries={['/user/user-2']}>
    <AuthProvider>
      <Routes>
        <Route path="/user/:id" element={<PublicProfile />} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe('Profil public : demande de partenariat', () => {
  test('remplace le bouton par « Demande envoyée » après l’envoi, sans message en dessous', async () => {
    storeSession();
    mockApi('none', { 'POST /user/user-2/request-partner': jsonResponse(201, {}) });
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole('button', { name: 'Demander en partenaire' }));

    expect(await screen.findByText('Demande envoyée')).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Demander en partenaire' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Demande de partenaire envoyée/)).not.toBeInTheDocument();
  });

  test('affiche « Demande envoyée » dès l’ouverture si une demande est déjà en attente', async () => {
    storeSession();
    mockApi('sent');
    renderProfile();

    expect(await screen.findByText('Demande envoyée')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Demander en partenaire' })).not.toBeInTheDocument();
  });

  test('propose de répondre quand la demande vient de l’autre utilisateur', async () => {
    storeSession();
    mockApi('received');
    renderProfile();

    expect(await screen.findByText('Demande reçue')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Répondre' })).toHaveAttribute('href', '/profil');
  });

  test('indique quand les deux utilisateurs sont déjà partenaires', async () => {
    storeSession();
    mockApi('partners');
    renderProfile();

    expect(await screen.findByText('Vous êtes partenaires')).toBeInTheDocument();
  });

  test('affiche l’erreur de l’API si l’envoi échoue', async () => {
    storeSession();
    mockApi('none', { 'POST /user/user-2/request-partner': jsonResponse(409, { message: 'Cet utilisateur vous a déjà envoyé une demande.' }) });
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole('button', { name: 'Demander en partenaire' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cet utilisateur vous a déjà envoyé une demande.');
    expect(screen.getByRole('button', { name: 'Demander en partenaire' })).toBeInTheDocument();
  });
});
