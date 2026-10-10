import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CreatePostButton from '../components/CreatePostButton';
import HomePosts from '../components/HomePosts';
import usePageTitle from '../hooks/usePageTitle';

export default function Home() {
  usePageTitle("Fil d'actualité");
  const location = useLocation();
  const navigate = useNavigate();
  const [justPublished] = useState(() => Boolean(location.state?.published));

  useEffect(() => {
    if (location.state?.published) {
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
        {justPublished && (
          <p className="alert alert-success home-alert" role="status">Votre post a été publié.</p>
        )}
        <HomePosts />
      </main>
    </>
  );
}
