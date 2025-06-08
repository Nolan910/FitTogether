import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthContext();

  return (
    <header className="header">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        FitTogether
      </h1>
      <nav>
        {isLoggedIn && user ? (
          <>
            <div><strong>{user.name}</strong></div>
            <div className="profil-preview" onClick={() => navigate('/profil')}>
              <img
                src={user.profilPic}
                alt={`Photo de profil de ${user.name || 'utilisateur'}`}
                className="profil-pic"
              />
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Connexion</button>
            <button onClick={() => navigate('/inscription')}>Inscription</button>
          </>
        )}

        <button onClick={() => navigate('/login')}>Connexion</button>
              <button onClick={() => navigate('/inscription')}>Inscription</button>
      </nav>
    </header>
  );
}