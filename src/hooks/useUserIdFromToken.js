import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useUserIdFromToken() {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Aucun token trouvé.');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.userId) {
        setUserId(decoded.userId);
      } else {
        setError('Token invalide.');
      }
    } catch (err) {
      console.error('Erreur de décodage du token :', err);
      setError('Token invalide.');
    }
  }, []);

  return { userId, error };
}
