import '../styles/Profil.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // if (!token || !userId) {
    //   setError("Utilisateur non connecté.");
    //   return navigate('/login');
    // }

    fetch(`http://localhost:3002/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Échec de récupération");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        setError("Erreur lors de la récupération du profil.");
      });
  }, [navigate]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (!user) return <div className="p-6">Chargement du profil...</div>;

  return (
    <div className="profil-container">
      <h1>Profil utilisateur</h1>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Nom :</strong> {user.nom || '-'}</p>
      <p><strong>Prénom :</strong> {user.prenom || '-'}</p>
      <p><strong>Objectif :</strong> {user.objectif || '-'}</p>
    </div>
  );
}
