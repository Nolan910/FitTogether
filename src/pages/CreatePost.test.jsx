import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../hooks/AuthProvider';
import CreatePost from './CreatePost';
import Home from './Home';
import { jsonResponse, mockFetch, storeSession } from '../test/utils';

const renderApp = () => render(
  <MemoryRouter initialEntries={['/create-post']}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe('Publication d’un post', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:apercu');
    URL.revokeObjectURL = vi.fn();
  });

  test('redirige vers le fil d’actualité avec un message de confirmation', async () => {
    storeSession();
    const fetchMock = mockFetch(jsonResponse(201, { _id: 'post-1' }), jsonResponse(200, []));
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/Description/), 'Séance jambes');
    await user.upload(screen.getByLabelText(/Photo/), new File(['image'], 'seance.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: 'Publier' }));

    expect(await screen.findByRole('heading', { level: 1, name: "Fil d'actualité" })).toBeInTheDocument();
    expect(screen.getByText('Votre post a été publié.')).toHaveAttribute('role', 'status');
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/createPoste');
  });

  test('reste sur la page et affiche l’erreur si la publication échoue', async () => {
    storeSession();
    mockFetch(jsonResponse(400, { message: "Format d'image non accepté (jpg, jpeg ou png)." }));
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/Description/), 'Séance jambes');
    await user.upload(screen.getByLabelText(/Photo/), new File(['image'], 'seance.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: 'Publier' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("Format d'image non accepté");
    expect(screen.getByRole('heading', { level: 1, name: 'Publier un post' })).toBeInTheDocument();
  });
});
