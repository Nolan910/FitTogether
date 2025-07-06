import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import ErrorModal from '../components/ErrorModal';
import '../styles/CreatePostButton.css';
import { useNavigate } from 'react-router-dom';

export default function CreatePostButton() {
  const { isLoggedIn } = useAuth();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowErrorModal(true);
    } else {
      navigate('/create-post');
    }
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    navigate('/login');
  };

   return (
    <div>
      <button className="create-post-button" onClick={handleClick}>
        + Publier un poste
      </button>

      {showErrorModal && (
        <ErrorModal
          message="Veuillez vous connecter pour publier un post"
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
