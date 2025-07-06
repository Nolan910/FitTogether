import '../styles/PublicProfil.css';
import UserPosts from '../components/UserPosts';
import Header from '../components/Header';
import ErrorModal from '../components/ErrorModal';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function PublicProfile() {
  const { id: viewedUserId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [currentUserPartners, setCurrentUserPartners] = useState([]);
  const navigate = useNavigate();

  // Récupération des infos du profil et si il est partenaire
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      const currentId = decoded.userId;
      setCurrentUserId(decoded.userId);

      fetch(`https://fittogether-back.onrender.com/user/${currentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserPartners(data.partners || []);
      })
      .catch(() => {
        console.error("Erreur lors du chargement des partenaires");
      });

    }else {
      setRequestMessage('Vous devez être connecté pour envoyer une demande.');
    return;
    }

    fetch(`https://fittogether-back.onrender.com/user/${viewedUserId}`)
      .then((res) => res.json())
      .then(setUser)
      .catch(() => setError("Erreur lors du chargement du profil utilisateur"));
  }, [viewedUserId]);

  // Envoi de la demande de partenaire
  const handleSendRequest = async () => {
  
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`https://fittogether-back.onrender.com/user/${viewedUserId}/request-partner`, {
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

  const isPartner = currentUserPartners.some(p => p._id === viewedUserId || p === viewedUserId);

  if (error) {
      return (
        <ErrorModal
          message={error}
          onClose={() => navigate(-1)}
        />
      );
    }
  
    if (!user) {
      return (
        <ErrorModal
          message="Veuillez vous connectez afin d'avoir accès aux profils des autres utilisateurs"
          onClose={() => navigate('/login')} 
        />
      );
    }

  return (
    <>
      <Header />
    <div className="public-profil-container">
      <h1>Profil de {user.name}</h1>
      <img
        src={user.profilPic || '/default-avatar.png'}
        alt={`Photo de profil de ${user.name || 'utilisateur'}`}
        className="profil-avatar"
      />
      <p><strong>{user.bio}</strong> </p>
      <p><strong>Niveau :</strong> {user.level}</p>
      <p><strong>Localisation :</strong> {user.location}</p>
      {isPartner ? (
        <p className="already-partner-msg">Tu es partenaire avec {user.name} !</p>
      ) : (
        <button onClick={handleSendRequest} className="partner-request-button">
          Demander en partenaire
        </button>
      )}
      {requestMessage && <p className="request-message">{requestMessage}</p>}
      <UserPosts />
    </div>
    </>
  );
}
