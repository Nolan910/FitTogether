import '../styles/CreatePost.css';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
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

    // Upload image sur Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'FitTogether_preset');

    try {
      
      const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dkzrgtcbw/image/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      const cloudinaryData = await cloudinaryRes.json();
      
      if (!cloudinaryData.secure_url) {
      console.error("Réponse Cloudinary erreur :", cloudinaryData);
      throw new Error("Échec de l'upload Cloudinary");
      }

      const imageUrl = cloudinaryData.secure_url;

      const res = await fetch('https://fittogether-back.onrender.com/createPoste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description,
          author: user._id || user.id,
          imageUrl,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusType('success');
        setMessage('Post publié !');
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

