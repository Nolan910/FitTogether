import { useEffect, useState } from 'react';
import '../styles/UserPosts.css';
import useUserIdFromToken from '../hooks/useUserIdFromToken';
import { Link } from 'react-router-dom';

export default function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const { userId, error: tokenError } = useUserIdFromToken();

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce post ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://fittogether-back.onrender.com/post/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    }
  };
  
  useEffect(() => {
    // const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (tokenError || !userId || !token) {
      //  setError(tokenError || "Utilisateur non connecté.");
      return;
    }

    fetch(`https://fittogether-back.onrender.com/user/${userId}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setError("Erreur lors du chargement des posts de l’utilisateur."));
  }, [userId, tokenError]);

  return (
    <div className="container">
      <h2>Mes posts</h2>
      {error && <p className="error">{error}</p>}

      {posts.length === 0 ? (
        <p>Vous n'avez pas encore publié.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
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

              <button onClick={() => handleDelete(post._id)} className="delete-button">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
