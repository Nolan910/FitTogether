import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import CreatePostButton from '../components/CreatePostButton';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="home-container">
      <header className="header">
        <h1>FitTogether</h1>
        <nav>
          <button onClick={() => navigate('/login')}>
            Connexion
          </button>
          <button onClick={() => navigate('/inscription')}>
            Inscription
          </button>
        </nav>
      </header>

      <main className="main">

        {isLoggedIn && user && (
        <p>Connecté en tant que <strong>{user.name}</strong></p>
        )}

        <h2>Trouve ton partenaire de sport en un clic</h2>
        
        <CreatePostButton />

      </main>
    </div>
  );
}
