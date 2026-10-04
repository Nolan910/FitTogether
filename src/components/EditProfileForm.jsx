import { useState, useEffect } from 'react';
import '../styles/EditProfileForm.css';
import useAuth from '../hooks/useAuth';
import { api } from '../api';

export default function EditProfileForm({ onUpdate }) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [newProfilPic, setNewProfilPic] = useState(null);
  const [newBio, setNewBio] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userId = currentUser?._id;

  // Récupération des données de l'utilisateur
  useEffect(() => {
    if (!userId) return;

    api(`/user/${userId}`)
      .then(data => {
        setUser(data);
        // Initialise les champs avec les données actuelles
        setNewName(data.name || '');
        setNewBio(data.bio || '');
        setNewLevel(data.level || '');
        setNewLocation(data.location || '');
        setNewProfilPic(data.profilPic || '');
      })
      .catch(() => setError("Erreur lors du chargement du profil"));
  }, [userId]);

  //Validation du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', newName);
    if (newProfilPic) {
        formData.append('profilPic', newProfilPic);
    }
    formData.append('bio', newBio);
    formData.append('level', newLevel);
    formData.append('location', newLocation);

    try {
      const updatedUser = await api(`/user/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      setSuccess("Profil mis à jour !");
      setError('');

      if (onUpdate) onUpdate(updatedUser);

    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  if (!user) return <p>Chargement du formulaire...</p>;

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <label>
        Nom :
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)} />
      </label>
      <label>
        Bio :
        <textarea
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          maxLength={1024}
        />
      </label>
      <label>
        Niveau :
        <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
          <option value="Débutant">Débutant.e</option>
          <option value="Habitué">Habitué.e</option>
          <option value="Experimenté">Expérimenté.e</option>
        </select>
      </label>
      <label>
        Localisation :
        <input
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
        />
      </label>
      <label>
        Photo :
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewProfilPic(e.target.files[0])} />
          {newProfilPic && typeof newProfilPic !== 'string' && (
            <img
                src={URL.createObjectURL(newProfilPic)}
                alt="Aperçu"
                style={{ width: '100px', height: '100px', marginTop: '10px' }}
            />
        )}
      </label>
      <button type="submit">Enregistrer</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}
