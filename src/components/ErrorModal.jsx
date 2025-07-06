import '../styles/ErrorModal.css';

export default function ErrorModal({ message, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <button className='modal-button' onClick={onClose}>Connexion</button>
      </div>
    </div>
  );
}
