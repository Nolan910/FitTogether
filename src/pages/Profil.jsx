import '../styles/Profil.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import UserPosts from '../components/UserPosts';
import EditProfileForm from '../components/EditProfileForm';

export default function Profil() {
  usePageTitle('Mon profil');
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
      setError("Erreur lors du chargement de votre profil.");
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

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page">
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <section className="card profile-hero" aria-labelledby="profile-name">
          <Avatar src={user.profilPic} name={user.name} size={96} />
          <div className="profile-hero-info">
            <p className="profile-eyebrow">Mon profil</p>
            <h1 id="profile-name">{user.name}</h1>
            <dl className="profile-facts">
              <div>
                <dt>Niveau</dt>
                <dd>{user.level}</dd>
              </div>
              <div>
                <dt>Localisation</dt>
                <dd>{user.location}</dd>
              </div>
            </dl>
            <p className="profile-bio">{user.bio || 'Aucune bio renseignée.'}</p>
          </div>
          <div className="profile-hero-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
              aria-expanded={isEditing}
              aria-controls="edit-profile"
            >
              {isEditing ? 'Fermer' : 'Modifier le profil'}
            </button>
            <button type="button" onClick={handleLogout} className="btn btn-ghost">
              Se déconnecter
            </button>
          </div>
        </section>

        {isEditing && (
          <div id="edit-profile" className="section">
            <EditProfileForm onUpdate={handleProfileUpdate} onCancel={() => setIsEditing(false)} />
          </div>
        )}

        {(partnerRequests.length > 0 || requestMessage) && (
          <section className="section" aria-labelledby="demandes-recues">
            <h2 id="demandes-recues">Demandes de partenaires reçues</h2>

            {requestMessage && (
              <p
                className={`alert ${requestMessageType === 'error' ? 'alert-error' : 'alert-success'}`}
                role={requestMessageType === 'error' ? 'alert' : 'status'}
              >
                {requestMessage}
              </p>
            )}

            {partnerRequests.length > 0 && (
              <ul className="card request-list">
                {partnerRequests.map(req => (
                  <li className="request-item" key={req._id}>
                    <Link to={`/user/${req.from._id}`} className="person-link">
                      <Avatar src={req.from.profilPic} name={req.from.name} size={40} />
                      <span>{req.from.name}</span>
                    </Link>
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRequestResponse(req._id, 'accepted')}
                        aria-label={`Accepter la demande de ${req.from.name}`}
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRequestResponse(req._id, 'rejected')}
                        aria-label={`Refuser la demande de ${req.from.name}`}
                      >
                        Refuser
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="section" aria-labelledby="partenaires">
          <h2 id="partenaires">Partenaires</h2>

          {partners.length === 0 ? (
            <p className="empty-state">Aucun partenaire pour le moment.</p>
          ) : (
            <ul className="partners-list">
              {partners.map((p) => (
                <li key={p._id}>
                  <Link to={`/user/${p._id}`} className="person-link partner-chip">
                    <Avatar src={p.profilPic} name={p.name} size={32} />
                    <span>{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <UserPosts />
      </main>
    </>
  );
}
