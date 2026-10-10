import { describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import ProtectedRoute from '../components/ProtectedRoute';
import Profil from './Profil';
import Home from './Home';
import { TEST_USER, jsonResponse, storeSession } from '../test/utils';

const mockApi = (deleteResponse = jsonResponse(200, { message: 'Compte supprimé avec succès.' })) => {
  const fetchMock = vi.fn((url, options = {}) => {
    const path = url.replace('http://api.test', '');
    if (options.method === 'DELETE' && path === '/deleteUser') return Promise.resolve(deleteResponse);
    if (path === '/user/user-1') return Promise.resolve(jsonResponse(200, { ...TEST_USER, level: 'Débutant', location: 'Lyon' }));
    if (path === '/user/user-1/partner-requests') return Promise.resolve(jsonResponse(200, []));
    if (path === '/user/user-1/partners') return Promise.resolve(jsonResponse(200, []));
    if (path === '/user/user-1/posts') return Promise.resolve(jsonResponse(200, []));
    if (path === '/posts') return Promise.resolve(jsonResponse(200, []));
    return Promise.resolve(jsonResponse(404, {}));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const renderApp = () => render(
  <MemoryRouter initialEntries={['/profil']}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<p>Page de connexion</p>} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

const openDeleteDialog = async (user) => {
  await user.click(await screen.findByRole('button', { name: 'Modifier le profil' }));
  await user.click(await screen.findByRole('button', { name: 'Supprimer mon compte' }));
};

describe('Suppression du compte', () => {
  test('le bouton se trouve dans le bloc de modification du profil', async () => {
    storeSession();
    mockApi();
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole('heading', { level: 1, name: 'Alice' });
    expect(screen.queryByRole('button', { name: 'Supprimer mon compte' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Modifier le profil' }));

    const editForm = await screen.findByRole('form', { name: 'Modifier le profil' });
    expect(within(editForm).getByRole('button', { name: 'Supprimer mon compte' })).toBeInTheDocument();
  });

  test('demande une confirmation avant de supprimer', async () => {
    storeSession();
    const fetchMock = mockApi();
    const user = userEvent.setup();
    renderApp();

    await openDeleteDialog(user);

    expect(screen.getByRole('alertdialog', { name: 'Supprimer votre compte ?' })).toBeInTheDocument();
    expect(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Annuler' })).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalledWith('http://api.test/deleteUser', expect.anything());
  });

  test('annuler ne supprime rien', async () => {
    storeSession();
    const fetchMock = mockApi();
    const user = userEvent.setup();
    renderApp();

    await openDeleteDialog(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith('http://api.test/deleteUser', expect.anything());
    expect(localStorage.getItem('token')).not.toBeNull();
  });

  test('supprime le compte, déconnecte et affiche une confirmation sur l’accueil', async () => {
    storeSession();
    const fetchMock = mockApi();
    const user = userEvent.setup();
    renderApp();

    await openDeleteDialog(user);
    await user.click(screen.getByRole('button', { name: 'Supprimer définitivement' }));

    expect(await screen.findByText('Votre compte a été supprimé.')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('heading', { level: 1, name: "Fil d'actualité" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/deleteUser', expect.objectContaining({ method: 'DELETE' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('reste connecté et affiche l’erreur si la suppression échoue', async () => {
    storeSession();
    mockApi(jsonResponse(500, { message: 'Erreur serveur.' }));
    const user = userEvent.setup();
    renderApp();

    await openDeleteDialog(user);
    await user.click(screen.getByRole('button', { name: 'Supprimer définitivement' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erreur serveur.');
    expect(localStorage.getItem('token')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Alice' })).toBeInTheDocument();
  });
});
