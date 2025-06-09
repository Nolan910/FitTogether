import { useEffect, useState } from 'react';
import '../styles/HomePosts.css';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function HomePosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error("Erreur de décodage du token", err);
      }
    }

    fetch('https://fittogether-back.onrender.com/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => setError('Erreur lors du chargement des posts.'));
  }, []);

  return (
    <div className="container">
      {/* <h2>Posts récents</h2> */}
      {error && <p className="error">{error}</p>}

      {posts.length === 0 ? (
        <p>Aucun post pour le moment.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => {
            const isCurrentUser = post.author._id === currentUserId;

            return (
              <div key={post._id} className="post-card">
                <Link to={`/post/${post._id}`} className="post-image-link">
                  <img src={post.imageUrl} alt="Post" />
                  <p className="description">{post.description}</p>
                </Link>

                {isCurrentUser ? (
                  <div className="author">
                    <img src={post.author.profilPic} alt="Auteur" />
                    <span>{post.author.name}</span>
                  </div>
                ) : (
                  <Link to={`/user/${post.author._id}`} className="author-link">
                    <div className="author">
                      <img src={post.author.profilPic} alt="Auteur" />
                      <span>{post.author.name}</span>
                    </div>
                  </Link>
                )}

                <p className="date">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
