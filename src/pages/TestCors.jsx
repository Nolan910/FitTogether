import { useEffect, useState } from 'react';

export default function TestCors() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3002/test', {
      credentials: 'include', 
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur dans la requête');
        return res.json();
      })
      .then(data => setMessage(data.message))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Test CORS</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}
    </div>
  );
}
