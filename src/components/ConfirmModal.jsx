import React from 'react';
import '../styles/ConfirmModal.css';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm" onClick={onConfirm}>Oui</button>
          <button className="cancel" onClick={onCancel}>Non</button>
        </div>
      </div>
    </div>
  );
}
