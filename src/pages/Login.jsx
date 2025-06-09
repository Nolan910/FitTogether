import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://fittogether-back.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Connexion réussie !');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setMessage(data.message || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur serveur. Veuillez réessayer.');
    }
  };

  return (
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
  );
}
