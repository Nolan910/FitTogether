import '../styles/Profil.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserPosts from '../components/UserPosts';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';

export default function PublicProfile() {
  const { id: viewedUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState('');
  const [currentUserPartners, setCurrentUserPartners] = useState([]);
  const currentUserId = currentUser?._id;
  usePageTitle(user ? `Profil de ${user.name}` : 'Profil');

  // Récupération des infos du profil et si il est partenaire
  useEffect(() => {
    api(`/user/${currentUserId}/partners`)
      .then(setCurrentUserPartners)
      .catch(() => {
        console.error("Erreur lors du chargement des partenaires");
      });

    api(`/user/${viewedUserId}`)
      .then(setUser)
      .catch(() => setError("Erreur lors du chargement du profil utilisateur."));
  }, [viewedUserId, currentUserId]);

  // Envoi de la demande de partenaire
  const handleSendRequest = async () => {
    try {
      await api(`/user/${viewedUserId}/request-partner`, { method: 'POST' });
      setRequestMessage('Demande de partenaire envoyée.');
      setRequestMessageType('success');
    } catch (err) {
      setRequestMessage(err.message);
      setRequestMessageType('error');
    }
  };

  const isOwnProfile = currentUserId === viewedUserId;
  const isPartner = currentUserPartners.some(p => p._id === viewedUserId);

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page">
        {error && (
          <div className="empty-state">
            <h1>Profil indisponible</h1>
            <p role="alert">{error} <Link to="/">Retour au fil d'actualité</Link></p>
          </div>
        )}

        {!error && !user && <p className="status" role="status">Chargement du profil…</p>}

        {user && (
          <>
            <section className="card profile-hero" aria-labelledby="profile-name">
              <Avatar src={user.profilPic} name={user.name} size={96} />
              <div className="profile-hero-info">
                <p className="profile-eyebrow">Profil</p>
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
                {isOwnProfile ? (
                  <Link to="/profil" className="btn btn-secondary">Gérer mon profil</Link>
                ) : isPartner ? (
                  <p className="partner-badge">Vous êtes partenaires</p>
                ) : (
                  <button type="button" onClick={handleSendRequest} className="btn btn-primary">
                    Demander en partenaire
                  </button>
                )}
              </div>
            </section>

            {requestMessage && (
              <p
                className={`alert section ${requestMessageType === 'error' ? 'alert-error' : 'alert-success'}`}
                role={requestMessageType === 'error' ? 'alert' : 'status'}
              >
                {requestMessage}
              </p>
            )}

            <UserPosts />
          </>
        )}
      </main>
    </>
  );
}
