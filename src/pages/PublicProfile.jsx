import '../styles/Profil.css';
import { useEffect, useRef, useState } from 'react';
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
  const [requestError, setRequestError] = useState('');
  const [relationship, setRelationship] = useState(null);
  const sentBadgeRef = useRef(null);
  const justSentRef = useRef(false);
  const currentUserId = currentUser?._id;
  const isOwnProfile = currentUserId === viewedUserId;
  usePageTitle(user ? `Profil de ${user.name}` : 'Profil');

  // Récupération des infos du profil et de la relation avec l'utilisateur connecté
  useEffect(() => {
    setRelationship(null);
    setRequestError('');

    if (!isOwnProfile) {
      api(`/user/${viewedUserId}/relationship`)
        .then((data) => setRelationship(data.status))
        .catch(() => setRelationship('none'));
    }

    api(`/user/${viewedUserId}`)
      .then(setUser)
      .catch(() => setError("Erreur lors du chargement du profil utilisateur."));
  }, [viewedUserId, isOwnProfile]);

  useEffect(() => {
    if (relationship === 'sent' && justSentRef.current) {
      justSentRef.current = false;
      sentBadgeRef.current?.focus();
    }
  }, [relationship]);

  // Envoi de la demande de partenaire
  const handleSendRequest = async () => {
    try {
      await api(`/user/${viewedUserId}/request-partner`, { method: 'POST' });
      setRequestError('');
      justSentRef.current = true;
      setRelationship('sent');
    } catch (err) {
      setRequestError(err.message);
    }
  };

  const renderRelationship = () => {
    if (isOwnProfile) {
      return <Link to="/profil" className="btn btn-secondary">Gérer mon profil</Link>;
    }
    if (relationship === 'partners') {
      return <p className="partner-badge">Vous êtes partenaires</p>;
    }
    if (relationship === 'sent') {
      return <p ref={sentBadgeRef} tabIndex={-1} className="request-badge">Demande envoyée</p>;
    }
    if (relationship === 'received') {
      return (
        <>
          <p className="request-badge">Demande reçue</p>
          <Link to="/profil" className="btn btn-primary">Répondre</Link>
        </>
      );
    }
    if (relationship === 'none') {
      return (
        <button type="button" onClick={handleSendRequest} className="btn btn-primary">
          Demander en partenaire
        </button>
      );
    }
    return null;
  };

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
              <div className="profile-hero-actions" aria-live="polite">
                {renderRelationship()}
              </div>
            </section>

            {requestError && (
              <p className="alert alert-error section" role="alert">{requestError}</p>
            )}

            <UserPosts />
          </>
        )}
      </main>
    </>
  );
}
