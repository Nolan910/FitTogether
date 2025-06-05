import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

export default function CreatePostButton() {
  const { isLoggedIn } = useAuth();
  const [message, setMessage] = useState('');

  const handleClick = () => {
    if (!isLoggedIn) {
      setMessage("Vous devez être connecté pour créer un post !");
      setTimeout(() => setMessage(''), 3000); // 3s
    } else {
      window.location.href = '/create-post';
    }
  };

  return (
    <div>
      <button onClick={handleClick}>➕ Créer un post</button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
