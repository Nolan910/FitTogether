import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';
import '../styles/Auth.css';

export default function Register() {
    usePageTitle('Inscription');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [level, setLevel] = useState('Débutant');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    //Envoi du formulaire
    const handleSubmit = async (e) => {
      e.preventDefault();

      // Prepare les données à envoyer au backend
      const userData = {
        name,
        email,
        password,
        level,
        bio,
        location,
      };

      try {
        await api('/createUser', { method: 'POST', body: userData });
        navigate('/login', { state: { registered: true } });
      } catch (err) {
        setMessage(err.message);
      }
    };

    return (
      <>
        <Header />
        <main id="contenu" tabIndex={-1} className="page auth-page">
          <div className="card auth-card">
            <h1>Créer un compte</h1>
            <p className="page-subtitle">Les champs marqués d'un astérisque (*) sont obligatoires.</p>

            <form onSubmit={handleSubmit} className="form-stack">
              <div className="field">
                <label htmlFor="register-name">Nom *</label>
                <input
                  id="register-name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="register-email">Email *</label>
                <input
                  id="register-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="nom@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="register-password">Mot de passe *</label>
                <input
                  id="register-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={72}
                  pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}"
                  aria-describedby="register-password-hint"
                  required
                />
                <p id="register-password-hint" className="field-hint">8 caractères minimum, avec au moins une lettre et un chiffre.</p>
              </div>

              <div className="field">
                <label htmlFor="register-level">Niveau *</label>
                <select
                  id="register-level"
                  className="input"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                >
                  <option value="Débutant">Débutant.e</option>
                  <option value="Habitué">Habitué.e</option>
                  <option value="Experimenté">Expérimenté.e</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="register-location">Localisation *</label>
                <input
                  id="register-location"
                  className="input"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Lyon"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="register-bio">Bio</label>
                <textarea
                  id="register-bio"
                  className="input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1024}
                />
              </div>

              {message && <p className="alert alert-error" role="alert">{message}</p>}

              <button type="submit" className="btn btn-primary btn-block">S'inscrire</button>
            </form>

            <p className="auth-switch">
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </main>
      </>
    );
  }
