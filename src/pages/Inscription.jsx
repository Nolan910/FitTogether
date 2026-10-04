import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../api';
import '../styles/Inscription.css';

export default function Register() {
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
        navigate('/login');
      } catch (err) {
        setMessage(err.message);
      }
    };

    return (
      <>
        <Header />
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Créer un compte</h2>

          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            minLength={8}
            maxLength={72}
            pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}"
            title="8 caractères minimum, avec au moins une lettre et un chiffre"
            required
          />

          <label htmlFor="level">Niveau</label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          >
            <option value="Débutant">Débutant.e</option>
            <option value="Habitué">Habitué.e</option>
            <option value="Experimenté">Expérimenté.e</option>
          </select>

          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1024}
          />

          <input
            type="text"
            placeholder="Localisation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <button type="submit">S'inscrire</button>

          {message && <p className="message">{message}</p>}
        </form>
      </>
    );
  }
