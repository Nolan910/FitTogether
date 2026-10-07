import { describe, expect, test } from 'vitest';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import { api } from '../api';
import { jsonResponse, makeToken, mockFetch, storeSession } from '../test/utils';

const renderAt = (path, page = <p>Page privée</p>) => render(
  <MemoryRouter initialEntries={[path]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<p>Page de connexion</p>} />
        <Route path="/profil" element={<ProtectedRoute>{page}</ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

function PageQuiAppelleLApi() {
  useEffect(() => {
    api('/user/user-1/partner-requests').catch(() => {});
  }, []);
  return <p>Page privée</p>;
}

describe('ProtectedRoute', () => {
  test('redirige vers /login sans être connecté', () => {
    renderAt('/profil');

    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(screen.queryByText('Page privée')).not.toBeInTheDocument();
  });

  test('affiche la page avec une session valide', () => {
    storeSession();

    renderAt('/profil');

    expect(screen.getByText('Page privée')).toBeInTheDocument();
  });

  test('redirige vers /login avec un token expiré', () => {
    storeSession(makeToken(-60));

    renderAt('/profil');

    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test("déconnecte et redirige quand l'API répond 401", async () => {
    storeSession();
    mockFetch(jsonResponse(401, { message: 'Session invalide ou expirée.' }));

    renderAt('/profil', <PageQuiAppelleLApi />);

    expect(await screen.findByText('Page de connexion')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
