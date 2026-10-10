import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../api';
import PostCard from './PostCard';

export default function HomePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  // Récupération des posts
  useEffect(() => {
    api('/posts')
      .then((data) => {
        setPosts(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return <p className="status" role="status">Chargement des posts…</p>;
  }

  if (status === 'error') {
    return <p className="alert alert-error" role="alert">Erreur lors du chargement des posts.</p>;
  }

  if (posts.length === 0) {
    return <p className="empty-state">Aucun post pour le moment.</p>;
  }

  return (
    <ul className="post-grid">
      {posts.map((post) => (
        <li key={post._id}>
          <PostCard post={post} headingLevel={2} currentUserId={user?._id} />
        </li>
      ))}
    </ul>
  );
}
