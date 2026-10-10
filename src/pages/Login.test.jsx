import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from './Login';
import { TEST_USER, jsonResponse, makeToken, mockFetch } from '../test/utils';

const renderApp = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ProtectedRoute><p>Page du chat</p></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

const fillAndSubmit = async (email, password) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Mot de passe'), password);
  await user.click(screen.getByRole('button', { name: 'Se connecter' }));
};

describe('Formulaire de connexion', () => {
  test("connecte l'utilisateur et le ramène sur la page demandée", async () => {
    const token = makeToken();
    const fetchMock = mockFetch(jsonResponse(200, { token, user: TEST_USER }));
    renderApp('/chat');

    await fillAndSubmit('alice@test.fr', 'motdepasse1');

    expect(await screen.findByText('Page du chat')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.fr', password: 'motdepasse1' }),
    }));
    expect(localStorage.getItem('token')).toBe(token);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(TEST_USER);
  });

  test("affiche le message d'erreur de l'API", async () => {
    mockFetch(jsonResponse(401, { message: 'Email ou mot de passe incorrect.' }));
    renderApp('/login');

    await fillAndSubmit('alice@test.fr', 'mauvais1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou mot de passe incorrect.');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email ou mot de passe incorrect.');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
