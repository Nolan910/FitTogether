import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

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
        <h2>Trouve ton partenaire de sport en un clic</h2>
        {/* <button onClick={() => navigate('/login')}>
          Commencer maintenant
        </button> */}
      </main>
    </div>
  );
}
