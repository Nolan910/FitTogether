import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/Inscription.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [level, setLevel] = useState('débutant');
    const [isAdmin, setIsAdmin] = useState(false);
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
  
    //Envoi du formulaire
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Prepare user data à envoyer au backend
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
          setMessage('Inscription réussie !');
          navigate('/login');
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
