import { useState } from 'react';
import '../styles/Inscription.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [profilPic, setProfilPic] = useState('');
    const [level, setLevel] = useState('débutant');
    const [isAdmin, setIsAdmin] = useState(false);
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Prepare user data to send to backend
      const userData = {
        name,
        email,
        password,
        level,
        isAdmin,
        bio,
        location,
        partenaire: null,
      };
  
      try {
        const res = await fetch('https://fittogether-back.onrender.com/createUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
  
        const data = await res.json();
  
        if (res.ok) {
          localStorage.setItem('token', data.token);
          setMessage('Utilisateur créé avec succès !');
          setName('');
          setEmail('');
          setPassword('');
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
