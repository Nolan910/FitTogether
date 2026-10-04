import '../styles/CreatePost.css';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { api } from '../api';

export default function CreatePost() {
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

  //Enlève l'image
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleCancel = () => {
    setDescription('');
    handleRemoveImage();
    setMessage('Publication annulée.');
  };

  // Nettoyage de l'URL de prévisualisation lors de la suppression de l'image
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Envoi du post
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setStatusType('error');
      setMessage("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', imageFile);

    try {
      await api('/createPoste', { method: 'POST', body: formData });

      setStatusType('success');
      setMessage('Post publié !');
      setDescription('');
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setStatusType('error');
      setMessage(err.message);
    }
  };

  return (
    <>
      <Header />

      <div className="form-page">
        <form onSubmit={handleSubmit} className="create-post-form">
          <h2>Publier un post</h2>

          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
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
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button"
            >
              Annuler
            </button>
          </div>

          {message && (
            <p className={`message ${statusType === 'success' ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </>
  );
}

