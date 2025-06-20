import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function CreatePostButton() {
  const { isLoggedIn } = useAuth();
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLoggedIn) {
      setMessage("Vous devez être connecté pour créer un post !");
      setTimeout(() => setMessage(''), 3000); // 3s
      navigate('/login');
    } else {
      navigate('/create-post');
    }
  };

  return (
    <div>
      <button onClick={handleClick}
      style={{ fontSize: '0.875rem', padding: '0.6rem 1rem' }}>➕ Publier un poste</button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
