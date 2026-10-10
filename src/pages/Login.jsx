import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';
import '../styles/Auth.css';

export default function Login() {
  usePageTitle('Connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedFrom = location.state?.from?.pathname;

  // Envoi du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await api('/login', {
        method: 'POST',
        body: { email, password },
      });

      login(data.token, data.user);
      navigate(redirectedFrom || '/', { replace: true });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page auth-page">
        <div className="card auth-card">
          <h1>Connexion</h1>
          <p className="page-subtitle">Retrouvez vos partenaires et vos séances.</p>

          {location.state?.registered && (
            <p className="alert alert-success" role="status">Votre compte a été créé. Vous pouvez vous connecter.</p>
          )}
          {redirectedFrom && !location.state?.registered && (
            <p className="alert alert-info" role="status">Connectez-vous pour accéder à cette page.</p>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="nom@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={message ? 'true' : undefined}
                aria-describedby={message ? 'login-error' : undefined}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={message ? 'true' : undefined}
                aria-describedby={message ? 'login-error' : undefined}
                required
              />
            </div>

            {message && <p id="login-error" className="alert alert-error" role="alert">{message}</p>}

            <button type="submit" className="btn btn-primary btn-block">Se connecter</button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
        </div>
      </main>
    </>
  );
}
