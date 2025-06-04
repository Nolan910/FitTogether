import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Profil.css'; // tu peux le réutiliser

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3002/user/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Utilisateur non trouvé');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        setError('Erreur lors du chargement du profil.');
      });
  }, [id]);

  if (error) return <div className="profil-container text-red-600">{error}</div>;
  if (!user) return <div className="profil-container">Chargement...</div>;

  return (
    <div className="profil-container">
      <h1>Profil de {user.name}</h1>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Niveau :</strong> {user.level}</p>
      <p><strong>Bio :</strong> {user.bio || 'Aucune bio'}</p>
      <p><strong>Localisation :</strong> {user.location}</p>
    </div>
  );
}
