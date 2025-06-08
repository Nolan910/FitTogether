import { useState, useEffect } from 'react';
import '../styles/EditProfileForm.css';
import { jwtDecode } from 'jwt-decode';

export default function EditProfileForm({ onUpdate }) {
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [newProfilPic, setNewProfilPic] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError("Utilisateur non connecté.");

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.userId;

      console.log('Données envoyées :', newName, newProfilPic);


      fetch(`http://localhost:3002/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setNewName(data.name || '');
          setNewProfilPic(data.profilPic || '');
        })
        .catch(() => setError("Erreur lors du chargement du profil"));
    } catch (err) {
      console.error(err);
      setError("Token invalide");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = user?._id;

    const formData = new FormData();
    formData.append('name', newName);
    if (newProfilPic) {
        formData.append('profilPic', newProfilPic);
    }

    try {
      const res = await fetch(`http://localhost:3002/user/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour.');

      const updatedUser = await res.json();

      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess("Profil mis à jour !");
      setError('');

      if (onUpdate) onUpdate(updatedUser);

    } catch (err) {
      console.error(err);
      setError("Échec de mise à jour du profil.");
    }
  };

  if (!user) return <p>Chargement du formulaire...</p>;

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <label>
        Nouveau nom :
        <input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </label>
      <label>
        URL de la nouvelle photo :
        <input type="file" accept="image/*" onChange={(e) => setNewProfilPic(e.target.files[0])} />
        {newProfilPic && typeof newProfilPic !== 'string' && (
            <img
                src={URL.createObjectURL(newProfilPic)}
                alt="Aperçu"
                style={{ width: '100px', height: '100px', marginTop: '10px' }}
            />
        )}
        {/* <input value={newProfilPic} onChange={(e) => setNewProfilPic(e.target.value)} /> */}
      </label>
      <button type="submit">Enregistrer</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}