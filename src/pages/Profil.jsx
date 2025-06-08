import '../styles/Profil.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import Header from '../components/Header';
import UserPosts from '../components/UserPosts';
import EditProfileForm from '../components/EditProfileForm';

export default function Profil() {
  const { user, setUser } = useAuthContext();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState('');

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
      fetch(`http://localhost:3002/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`http://localhost:3002/user/${userId}/partner-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`http://localhost:3002/user/${userId}/partners`, {
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

  const handleProfileUpdate  = (updatedUser) => { 
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleRequestResponse = async (requestId, status) => {
    const token = localStorage.getItem('token');

  try {
    const res = await fetch(`http://localhost:3002/partner-requests/${requestId}`, {
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


  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (!user) return <div className="p-6">Chargement du profil...</div>;

  return (
  <>
  <Header />
    <div className="profil-container">
    <h1>Votre profil</h1>

    <div className="profil-header">
      <img
        src={user.profilPic || '/default-avatar.png'}
        alt={`Photo de profil de ${user.name || 'utilisateur'}`}
        className="profil-avatar"
      />
      <div className="profil-infos">
      <p><strong> {user.name} </strong></p>
      </div>

      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Fermer' : 'Modifier le profil'}
      </button>

      {isEditing && user && (
        <EditProfileForm onUpdate={handleProfileUpdate } />
      )}
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
                  <button onClick={() => handleRequestResponse(req._id)}>Accepter</button>
                  <button onClick={() => handleRequestResponse(req._id)}>Refuser</button>
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
                <img src={p.profilPic || '/default-avatar.png'} alt={p.name} />
                <span>{p.name}</span>
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
