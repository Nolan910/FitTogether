import '../styles/PublicProfil.css';
import UserPosts from '../components/UserPosts';
import Header from '../components/Header';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function PublicProfile() {
  const { id: viewedUserId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId);
      // setCurrentUserId(token.userId);
    }else {
      setRequestMessage('Vous devez être connecté pour envoyer une demande.');
    return;
    }

    fetch(`http://localhost:3002/user/${viewedUserId}`)
      .then((res) => res.json())
      .then(setUser)
      .catch(() => setError("Erreur lors du chargement du profil utilisateur"));
  }, [viewedUserId]);

  const handleSendRequest = async () => {
  
  const token = localStorage.getItem('token');

  try {
    console.log('Données envoyées :', { from: currentUserId, to: viewedUserId });

    const res = await fetch(`http://localhost:3002/user/${viewedUserId}/request-partner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ from: currentUserId, to: viewedUserId  }),
    });

    const data = await res.json();

    if (res.ok) {
      setRequestMessage('Demande envoyée avec succès.');
    } else {
      setRequestMessage(data.message || 'Erreur lors de l’envoi de la demande.');
    }
  } catch (error) {
    console.error('Erreur lors de l’envoi de la demande :', error);
    setRequestMessage('Erreur réseau.');
  }
};

  if (error) return <p className="error">{error}</p>;
  if (!user) return <p>Chargement du profil...</p>;

  return (
    <>
      <Header />
    <div className="public-profil-container">
      <h2>Profil de {user.name}</h2>
      <img
        src={user.profilPic || '/default-avatar.png'}
        alt={`Photo de profil de ${user.name || 'utilisateur'}`}
        className="profil-avatar"
      />
      {/* <img src={user.profilPic || '/default-avatar.png'} alt="Avatar" /> */}
      <p>Email : {user.email}</p>
      <p>Objectif : {user.objectif}</p>

      <button onClick={handleSendRequest} className="partner-request-button">
        Demander en partenaire
      </button>
      {requestMessage && <p className="request-message">{requestMessage}</p>}

      
      <UserPosts />

    </div>
    </>
  );
}
