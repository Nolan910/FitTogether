import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CreatePostButton from '../components/CreatePostButton';
import HomePosts from '../components/HomePosts';
import usePageTitle from '../hooks/usePageTitle';

const NOTICES = {
  published: 'Votre post a été publié.',
  accountDeleted: 'Votre compte a été supprimé.',
};

export default function Home() {
  usePageTitle("Fil d'actualité");
  const location = useLocation();
  const navigate = useNavigate();
  const [notice] = useState(() => {
    const key = Object.keys(NOTICES).find((name) => location.state?.[name]);
    return key ? NOTICES[key] : '';
  });

  useEffect(() => {
    if (location.state?.published || location.state?.accountDeleted) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page">
        <div className="page-header">
          <div>
            <h1>Fil d'actualité</h1>
            <p className="page-subtitle">Les dernières séances de la communauté</p>
          </div>
          <CreatePostButton />
        </div>
        {notice && (
          <p className="alert alert-success home-alert" role="status">{notice}</p>
        )}
        <HomePosts />
      </main>
    </>
  );
}
