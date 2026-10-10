import '../styles/CreatePost.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';

export default function CreatePost() {
  usePageTitle('Publier un post');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [statusType, setStatusType] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setDescription('');
    handleRemoveImage();
    setStatusType('');
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
      setMessage('Post publié.');
      setDescription('');
      handleRemoveImage();
    } catch (err) {
      setStatusType('error');
      setMessage(err.message);
    }
  };

  const imageError = statusType === 'error' && !imageFile;

  return (
    <>
      <Header />

      <main id="contenu" tabIndex={-1} className="page page-narrow">
        <div className="page-header">
          <div>
            <h1>Publier un post</h1>
            <p className="page-subtitle">Partagez votre dernière séance avec la communauté.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card form-stack create-post-form">
          <div className="field">
            <label htmlFor="post-description">Description *</label>
            <input
              id="post-description"
              className="input"
              type="text"
              placeholder="Séance jambes, 45 minutes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="post-image">Photo *</label>
            <input
              id="post-image"
              ref={fileInputRef}
              className="input input-file"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              aria-describedby={imageError ? 'post-image-hint post-message' : 'post-image-hint'}
              aria-invalid={imageError ? 'true' : undefined}
            />
            <p id="post-image-hint" className="field-hint">JPG ou PNG, 5 Mo maximum.</p>
          </div>

          {previewUrl && (
            <div className="preview-container">
              <img src={previewUrl} alt="Aperçu de la photo sélectionnée" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleRemoveImage}>
                Retirer la photo
              </button>
            </div>
          )}

          {message && (
            <p
              id="post-message"
              className={`alert ${statusType === 'error' ? 'alert-error' : 'alert-success'}`}
              role={statusType === 'error' ? 'alert' : 'status'}
            >
              {message} {statusType === 'success' && <Link to="/">Voir le fil d'actualité</Link>}
            </p>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary">Publier</button>
          </div>
        </form>
      </main>
    </>
  );
}
