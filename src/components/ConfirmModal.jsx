import Modal from './Modal';

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  title = 'Confirmer la suppression',
  confirmLabel = 'Supprimer',
}) {
  return (
    <Modal
      role="alertdialog"
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </>
      )}
    >
      <p>{message}</p>
    </Modal>
  );
}
