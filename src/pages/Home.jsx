import '../styles/Home.css';
import Header from '../components/Header';
import CreatePostButton from '../components/CreatePostButton';
import HomePosts from '../components/HomePosts';
// import useAuth from '../hooks/useAuth';

export default function Home() {
  // const { isLoggedIn, user } = useAuth();

  return (
    <div className="home-container">
      <Header />

      <main className="main">

        {/* {isLoggedIn && user && (
        <p>Connecté en tant que <strong>{user.name}</strong></p>
        )} */}
        <div className="content-container">
          <div className="posts-header">
            <h2>Les postes des utilisateurs</h2>
            <CreatePostButton />
          </div>

          <HomePosts />
        </div>

      </main>
    </div>
  );
}
