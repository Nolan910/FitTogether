import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import PostCard from './PostCard';
import useAuth from '../hooks/useAuth';
import { api } from '../api';

export default function UserPosts() {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
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

  const canDelete = (post) => user && (post.author._id === user._id || user.isAdmin);

  //Supression d'un post
  const handleConfirmDelete = async () => {
    try {
      await api(`/post/${postToDelete}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(post => post._id !== postToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setPostToDelete(null);
    }
  };

  return (
    <section className="section" aria-labelledby="posts-publies">
      <h2 id="posts-publies">Posts publiés</h2>
      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {posts.length === 0 ? (
        <p className="empty-state">Pas encore de publications.</p>
      ) : (
        <ul className="post-grid">
          {posts.map((post) => (
            <li key={post._id}>
              <PostCard
                post={post}
                headingLevel={3}
                linkAuthor={false}
                onDelete={canDelete(post) ? setPostToDelete : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      {postToDelete && (
        <ConfirmModal
          title="Supprimer ce post ?"
          message="Le post et ses commentaires seront définitivement supprimés."
          onConfirm={handleConfirmDelete}
          onCancel={() => setPostToDelete(null)}
        />
      )}
    </section>
  );
}
