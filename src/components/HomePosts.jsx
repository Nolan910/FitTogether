import { useEffect, useState } from 'react';
import '../styles/HomePosts.css';
import { Link } from 'react-router-dom';

export default function HomePosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3002/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => setError('Erreur lors du chargement des posts.'));
  }, []);

  return (
    <div className="container">
      <h2>Posts récents</h2>
      {error && <p className="error">{error}</p>}

      {posts.length === 0 ? (
        <p>Aucun post pour le moment.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`} className="post-card-link">
                <div className="post-card">
                    <img src={`http://localhost:3002${post.imageUrl}`} alt="Post" />
                    <p className="description">{post.description}</p>
                    <div className="author">
                    <img src={post.author.profilPic} alt="Author" />
                    <span>{post.author.name}</span>
                    </div>
                    <p className="date">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
