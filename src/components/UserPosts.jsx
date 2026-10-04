import { useEffect, useState } from 'react';
import '../styles/UserPosts.css';
import ConfirmModal from '../components/ConfirmModal';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { api } from '../api';

export default function UserPosts() {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const userId = profileId || user?._id;


  // Récupération des posts de l'utilisateur
  useEffect(() => {
    if (!userId) {
      return;
    }

    api(`/user/${userId}/posts`)
      .then(setPosts)
      .catch(() => setError("Erreur lors du chargement des posts de l’utilisateur."));
  }, [userId]);

  // Demande de confirmation de la suppression d'un post
  const deletePost = (postId) => {
    setPostToDelete(postId);
    setShowModal(true);
  };

  //Supression d'un post
  const handleConfirmDelete = async () => {
    try {
      await api(`/post/${postToDelete}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(post => post._id !== postToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowModal(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="container">
  <h2>Posts publiés</h2>
  {error && <p className="error">{error}</p>}

  {posts.length === 0 ? (
    <p>Pas encore de publications</p>
  ) : (
    <div className="posts-list">
      {posts.map((post) => {
        return (
          <div key={post._id} className="post-card-wrapper">
            <Link to={`/post/${post._id}`} className="post-card-link">
              <div className="post-card">
                <img src={post.imageUrl} alt="Post" />
                <p className="description">{post.description}</p>
                <div className="author">
                  <img src={post.author.profilPic} alt="Auteur" />
                  <span>{post.author.name}</span>
                </div>
                <p className="date">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
            {user && (post.author._id === user._id || user.isAdmin) && (
              <button onClick={() => deletePost(post._id)} className="delete-button">
                Supprimer
              </button>
            )}
          </div>
        );
      })}
    </div>
  )}
      {showModal && (
        <ConfirmModal
          message="Voulez-vous vraiment supprimer ce post ?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
