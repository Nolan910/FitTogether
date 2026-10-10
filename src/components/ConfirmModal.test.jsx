import { describe, expect, test, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

function Page({ onConfirm = () => {} }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Supprimer le post</button>
      {open && (
        <ConfirmModal
          title="Supprimer ce post ?"
          message="Le post sera définitivement supprimé."
          onConfirm={onConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

describe('ConfirmModal', () => {
  test('est une boîte de dialogue modale nommée et décrite', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole('button', { name: 'Supprimer le post' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Supprimer ce post ?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Le post sera définitivement supprimé.');
  });

  test('place le focus dans la modale, sur le bouton le moins risqué', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole('button', { name: 'Supprimer le post' }));

    expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus();
  });

  test('garde le focus dans la modale avec Tab', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: 'Supprimer le post' }));

    await user.tab();
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus();
  });

  test('se ferme avec Échap et rend le focus au bouton qui l’a ouverte', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const opener = screen.getByRole('button', { name: 'Supprimer le post' });
    await user.click(opener);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  test('appelle onConfirm au clic sur Supprimer', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Page onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Supprimer le post' }));

    await user.click(screen.getByRole('button', { name: 'Supprimer' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
