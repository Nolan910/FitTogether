import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useAuth from '../hooks/useAuth';
import { api } from '../api';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Envoi du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await api('/login', {
        method: 'POST',
        body: { email, password },
      });

      login(data.token, data.user);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Connexion</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Se connecter</button>

          {message && <p className="message">{message}</p>}

          <p className="signup-link">
            <Link to="/inscription">S'inscrire</Link>
          </p>
        </form>
      </div>
    </>
  );
}
