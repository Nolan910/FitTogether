import '../styles/Profil.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { api } from '../api';
import Header from '../components/Header';
import UserPosts from '../components/UserPosts';
import EditProfileForm from '../components/EditProfileForm';
import ErrorModal from '../components/ErrorModal';

export default function Profil() {
  const { user, updateUser, logout } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState('');
  const userId = user?._id;

  //Récupére l'utilisateur ses données
  const fetchUserAndRelatedData = useCallback(async () => {
    try {
      const [userInfo, requests, partners] = await Promise.all([
        api(`/user/${userId}`),
        api(`/user/${userId}/partner-requests`),
        api(`/user/${userId}/partners`),
      ]);

      updateUser(userInfo);
      setPartnerRequests(requests);
      setPartners(partners);

    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
      setError("Erreur de chargement.");
    }
  }, [userId, updateUser]);

  useEffect(() => {
    fetchUserAndRelatedData();
  }, [fetchUserAndRelatedData]);

// Mise à jour du profil après modification
  const handleProfileUpdate = (updatedUser) => {
  updateUser(updatedUser);
  fetchUserAndRelatedData();
};

  // Gestion de la réponse à une demande de partenaire
  const handleRequestResponse = async (requestId, status) => {
  try {
    await api(`/partner-requests/${requestId}`, {
      method: 'PUT',
      body: { status },
    });

    // Recharge tout l'état du profil
    await fetchUserAndRelatedData();

    setRequestMessage(status === 'accepted' ? 'Demande acceptée' : 'Demande refusée');
    setRequestMessageType('success');

    setTimeout(() => {
      setRequestMessage('');
    }, 3000);

  } catch (err) {
    setRequestMessage(err.message);
    setRequestMessageType('error');
  }

};

// Déconnexion
  const handleLogout = () => {
  logout();
  navigate('/login');
};

if (error) {
    return (
      <ErrorModal
        message={error}
        onClose={() => navigate(-1)}
      />
    );
  }

return (
  <>
    <Header />
    <div className="profil-container">
      <h1>Votre profil</h1>

      <div className="profil-header">
        <img
          src={user.profilPic || '/default-avatar.png'}
          alt={`Photo de profil`}
          className="profil-avatar"
        />

        <div className="profil-infos">
          <h2><strong>{user.name}</strong></h2>
        </div>

        <button className="modify-profil-button" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Fermer' : 'Modifier le profil'}
        </button>

        {isEditing && (
          <EditProfileForm onUpdate={handleProfileUpdate} />
        )}

        {!isEditing && (
          <button onClick={handleLogout} className="logout-button">
            Se déconnecter
          </button>
        )}
      </div>

      <div className="profil-info-card">
        <div className="info-row">
          <span className="info-icon"></span>
          <span className="info-label">Bio :</span>
          <span className="info-value">{user.bio || "Aucune bio renseignée"}</span>
        </div>

        <div className="info-row">
          <span className="info-icon"></span>
          <span className="info-label">Niveau :</span>
          <span className="info-value">{user.level}</span>
        </div>

        <div className="info-row">
          <span className="info-icon"></span>
          <span className="info-label">Localisation :</span>
          <span className="info-value">{user.location}</span>
        </div>
      </div>


      {partnerRequests.length > 0 && (
        <div className="partner-requests">
          <h3>Demandes de partenaires reçues</h3>
          <ul>
            {partnerRequests.map(req => (
              <div className="request-item" key={req._id}>
                <Link to={`/user/${req.from._id}`} className="request-user-link">
                  <img src={req.from.profilPic} alt="Demandeur" className="request-avatar" />
                </Link>

                <span>{req.from.name}</span>

                <button onClick={() => handleRequestResponse(req._id, 'accepted')}>
                  Accepter
                </button>

                <button onClick={() => handleRequestResponse(req._id, 'rejected')}>
                  Refuser
                </button>

                {requestMessage && (
                  <div className={`partner-message ${requestMessageType}`}>
                    {requestMessage}
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      )}

      <div className="partenaires-section">
        <h3>Partenaires</h3>

        {partners.length === 0 ? (
          <p>Aucun partenaire pour le moment.</p>
        ) : (
          <ul className="partners-list">
            {partners.map((p) => (
              <li key={p._id}>
                <Link to={`/user/${p._id}`} className="partner-link">
                  <img src={p.profilPic || '/default-avatar.png'} alt={p.name} />
                  <span>{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UserPosts />
    </div>
  </>
);

}
