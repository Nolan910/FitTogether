import Header from '../components/Header';
import CreatePostButton from '../components/CreatePostButton';
import HomePosts from '../components/HomePosts';
import usePageTitle from '../hooks/usePageTitle';

export default function Home() {
  usePageTitle("Fil d'actualité");

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
        <HomePosts />
      </main>
    </>
  );
}
