import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthContext();

  return (
    <header className="header">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer', marginLeft: 50 }}>
        FitTogether
      </h1>
      <nav>
        {isLoggedIn && user ? (
          <div className="user-info">
            <button onClick={() => navigate('/chat')}>Chat</button>
            <div><strong>{user.name}</strong></div>
            <div className="profil-preview" onClick={() => navigate('/profil')}>
              <img
                src={user.profilPic}
                alt={`Photo de profil de ${user.name || 'utilisateur'}`}
                className="profil-pic"
              />
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Connexion</button>
            <button onClick={() => navigate('/inscription')}>Inscription</button>
          </>
        )}
      </nav>
      {/* <button onClick={() => navigate('/login')}>Connexion</button>
              <button onClick={() => navigate('/inscription')}>Inscription</button> */}
    </header>
  );
}