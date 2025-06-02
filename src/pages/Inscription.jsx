import { useState } from 'react';
import './Inscription.css';

export default function Register() {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilPic, setProfilPic] = useState('');
    const [level, setLevel] = useState('débutant');
    const [isAdmin, setIsAdmin] = useState(false);
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const userData = {
        nom,
        email,
        password,
        profilPic,
        level,
        isAdmin,
        bio,
        location,
      };
  
      try {
        const res = await fetch('http://localhost:5000/createUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setMessage('Utilisateur créé avec succès !');
          setNom('');
          setEmail('');
          setPassword('');
          setProfilPic('');
          setLevel('');
          setIsAdmin(false);
          setBio('');
          setLocation('');
        } else {
          setMessage(data.message || 'Erreur lors de la création');
        }
      } catch (err) {
        console.error(err);
        setMessage('Erreur serveur. Veuillez réessayer.');
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Créer un compte</h2>
  
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
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
          required
        />
  
        <label htmlFor="level">Niveau</label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
        >
          <option value="débutant">Débutant</option>
          <option value="intermédiaire">Intermédiaire</option>
          <option value="avancé">Avancé</option>
          <option value="expert">Expert</option>
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
    );
  }
