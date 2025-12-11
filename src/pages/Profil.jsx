import '../styles/Profil.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import Header from '../components/Header';
import UserPosts from '../components/UserPosts';
import EditProfileForm from '../components/EditProfileForm';
import ErrorModal from '../components/ErrorModal';

export default function Profil() {
  const { user, setUser } = useAuthContext();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState('');
  
  //Récupére l'utilisateur ses données
  const fetchUserAndRelatedData = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setError('Utilisateur non connecté.');
      return;
    }

    try {
      const userId = user?.id || user?._id;

      const [userRes, requestsRes, partnersRes] = await Promise.all([
        fetch(`https://fittogether-back.onrender.com/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://fittogether-back.onrender.com/user/${userId}/partner-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://fittogether-back.onrender.com/user/${userId}/partners`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userRes.ok || !requestsRes.ok || !partnersRes.ok) {
        throw new Error("Erreur lors du chargement des données.");
      }

      const [userInfo, requests, partners] = await Promise.all([
        userRes.json(),
        requestsRes.json(),
        partnersRes.json(),
      ]);

      setUser(userInfo);
      setPartnerRequests(requests);
      setPartners(partners);

    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
      setError("Erreur de chargement.");
    }
  };

  useEffect(() => {
    fetchUserAndRelatedData();
  }, [navigate]);

// Mise à jour du profil après modification
  const handleProfileUpdate = (updatedUser) => {
  setUser(updatedUser); 
  localStorage.setItem('user', JSON.stringify(updatedUser));
  fetchUserAndRelatedData(); 
};

  // Gestion de la réponse à une demande de partenaire
  const handleRequestResponse = async (requestId, status) => {
    const token = localStorage.getItem('token');

  try {
    const res = await fetch(`https://fittogether-back.onrender.com/partner-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error("Erreur lors de la mise à jour");

    // Recharge tout l'état du profil
    await fetchUserAndRelatedData();

    console.log("Statut reçu :", status);

    setRequestMessage(`Demande ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès`);
    setRequestMessageType('success');

    setTimeout(() => {
      setRequestMessage('');
    }, 3000);

  } catch (err) {
    console.error(err);
    alert("Erreur lors de la réponse à la demande");
  }

};

// Déconnexion
  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  navigate('/login'); 
};

if (!user) {
    return (
      <ErrorModal
        message="Veuillez vous connectez afin d'avoir accès à votre profil"
        onClose={() => navigate('/login')} 
      />
    );
  }

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

        {isEditing && user && (
          <EditProfileForm onUpdate={handleProfileUpdate} />
        )}

        {!isEditing && user && (
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

                <button onClick={() => handleRequestResponse(req._id, 'refused')}>
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
