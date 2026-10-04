import '../styles/PublicProfil.css';
import UserPosts from '../components/UserPosts';
import Header from '../components/Header';
import ErrorModal from '../components/ErrorModal';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../api';

export default function PublicProfile() {
  const { id: viewedUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [currentUserPartners, setCurrentUserPartners] = useState([]);
  const navigate = useNavigate();
  const currentUserId = currentUser?._id;

  // Récupération des infos du profil et si il est partenaire
  useEffect(() => {
    api(`/user/${currentUserId}/partners`)
      .then(setCurrentUserPartners)
      .catch(() => {
        console.error("Erreur lors du chargement des partenaires");
      });

    api(`/user/${viewedUserId}`)
      .then(setUser)
      .catch(() => setError("Erreur lors du chargement du profil utilisateur"));
  }, [viewedUserId, currentUserId]);

  // Envoi de la demande de partenaire
  const handleSendRequest = async () => {
  try {
    await api(`/user/${viewedUserId}/request-partner`, { method: 'POST' });
    setRequestMessage('Demande de partenaire envoyée.');
  } catch (err) {
    setRequestMessage(err.message);
  }
};

  const isOwnProfile = currentUserId === viewedUserId;
  const isPartner = currentUserPartners.some(p => p._id === viewedUserId);

  if (error) {
      return (
        <ErrorModal
          message={error}
          onClose={() => navigate(-1)}
        />
      );
    }

    if (!user) {
      return <ErrorModal message="Chargement en cours..." />;
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
      {isOwnProfile ? null : isPartner ? (
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
