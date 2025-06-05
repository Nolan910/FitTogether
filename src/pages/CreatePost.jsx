import '../styles/CreatePost.css';
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

export default function CreatePost() {
  const { user, isLoggedIn } = useAuth();
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleCancel = () => {
    setDescription('');
    handleRemoveImage();
    setMessage('Publication annulée.');
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !user) {
      setStatusType('error');
      setMessage("Utilisateur non identifié. Veuillez vous connecter.");
      return;
    }

    if (!imageFile) {
      setStatusType('error');
      setMessage("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('author', user.id);
    formData.append('image', imageFile);

    try {
      const res = await fetch('http://localhost:3002/createPoste', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatusType('success');
        setMessage('Post créé avec succès !');
        setDescription('');
        setImageFile(null);
        setPreviewUrl(null);
      } else {
        setStatusType('error');
        setMessage(data.message || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error(err);
      setStatusType('error');
      setMessage('Erreur réseau. Veuillez réessayer.');
    }
  };

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="create-post-form">
        <h2>Publier un post</h2>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {!imageFile && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        )}

        {previewUrl && (
          <div className="preview-container">
            <img src={previewUrl} alt="Aperçu" />
            <button type="button" onClick={handleRemoveImage}>
              Supprimer l’image
            </button>
          </div>
        )}

        <div className="button-row">
          <button type="submit">Publier</button>
          <button type="button" onClick={handleCancel} className="cancel-button">
            Annuler
          </button>
        </div>

        {message && <p className={`message ${statusType === 'success' ? 'success' : 'error'}`}>{message}</p>}
    </form>
  </div>
  );
}

