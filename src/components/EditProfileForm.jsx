import { useState, useEffect } from 'react';
import '../styles/EditProfileForm.css';
import useAuth from '../hooks/useAuth';
import { api } from '../api';

export default function EditProfileForm({ onUpdate, onCancel }) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [newProfilPic, setNewProfilPic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
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
      })
      .catch(() => setError("Erreur lors du chargement du profil"));
  }, [userId]);

  useEffect(() => {
    if (!newProfilPic) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newProfilPic);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newProfilPic]);

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

      setSuccess("Profil mis à jour.");
      setError('');

      if (onUpdate) onUpdate(updatedUser);

    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  };

  if (!user) {
    return error
      ? <p className="alert alert-error" role="alert">{error}</p>
      : <p className="status" role="status">Chargement du formulaire…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="card form-stack edit-profile-form" aria-labelledby="edit-profile-title">
      <h2 id="edit-profile-title">Modifier le profil</h2>

      <div className="edit-profile-grid">
        <div className="field">
          <label htmlFor="edit-name">Nom</label>
          <input
            id="edit-name"
            className="input"
            autoComplete="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            minLength={2}
            maxLength={50}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-location">Localisation</label>
          <input
            id="edit-location"
            className="input"
            autoComplete="address-level2"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-level">Niveau</label>
          <select id="edit-level" className="input" value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
            <option value="Débutant">Débutant.e</option>
            <option value="Habitué">Habitué.e</option>
            <option value="Experimenté">Expérimenté.e</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="edit-photo">Photo de profil</label>
          <input
            id="edit-photo"
            className="input input-file"
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setNewProfilPic(e.target.files[0] || null)}
            aria-describedby="edit-photo-hint"
          />
          <p id="edit-photo-hint" className="field-hint">JPG ou PNG, 5 Mo maximum.</p>
        </div>
      </div>

      {previewUrl && (
        <img src={previewUrl} alt="Aperçu de la nouvelle photo de profil" className="edit-profile-preview" />
      )}

      <div className="field">
        <label htmlFor="edit-bio">Bio</label>
        <textarea
          id="edit-bio"
          className="input"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          maxLength={1024}
        />
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {success && <p className="alert alert-success" role="status">{success}</p>}

      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>}
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </div>
    </form>
  );
}
