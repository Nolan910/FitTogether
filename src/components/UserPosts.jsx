import { useEffect, useState } from 'react';
import '../styles/UserPosts.css';
import ConfirmModal from '../components/ConfirmModal';
import { useParams, Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

export default function UserPosts() {
  const { user } = useAuthContext();
  const { id: profileId } = useParams();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);


  const confirmDeletePost = (postId) => {
  setPostToDelete(postId);
  setShowModal(true);
};

  // Récupération des posts de l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !profileId) {
      return;
    }

    fetch(`https://fittogether-back.onrender.com/user/${profileId}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setError("Erreur lors du chargement des posts de l’utilisateur."));
  }, [profileId]);


  //Supression d'un post
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`https://fittogether-back.onrender.com/post/${postToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts(prev => prev.filter(post => post._id !== postToDelete));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
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
            {user && post.author._id === user._id && (
              <button onClick={() => confirmDeletePost(post._id)} className="delete-button">
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
