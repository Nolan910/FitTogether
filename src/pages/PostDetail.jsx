import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import useAuth from '../hooks/useAuth';
import '../styles/PostDetail.css'; 

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3002/post/${id}`);
        const data = await res.json();
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:3002/post/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          authorId: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPost((prev) => ({
          ...prev,
          comments: [data.comment, ...prev.comments],
        }));
        setNewComment('');
      } else {
        setError(data.message || 'Erreur lors de l’ajout du commentaire');
      }
    } catch (err) {
        console.error(err);
      setError('Erreur réseau');
    }
  };

  const handleDeleteComment = async (commentId) => {
  if (!window.confirm("Supprimer ce commentaire ?")) return;

  try {
    const res = await fetch(`http://localhost:3002/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId),
      }));   
    } else {
      console.error("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error(err);
  }
};

  if (loading) return <p>Chargement...</p>;
  if (!post) return <p>Post introuvable</p>;

  return (
    <>
    <Header />
  
    <div className="post-detail">
      <img src={`http://localhost:3002${post.imageUrl}`} alt="Photo" />
      <div className="post-author">
        <img src={post.author.profilPic} alt={`Photo de profil de ${post.author.name}`} className="author-picture" />
        <h2>{post.author.name}</h2>
      </div>

        <p>{post.description}</p>

      <h3>Commentaires</h3>
      <ul className="comments-list">
        {post.comments.map((comment) => (
          <li key={comment._id}>
            <strong>{comment.author?.name} :</strong>
             <span className="comment-date">
                — {new Date(comment.createdAt).toLocaleString()}
            </span>
            <br />
            {comment.content}

            {user && user.id === comment.author._id && (
                <button onClick={() => handleDeleteComment(comment._id)}>Supprimer</button>
            )}
          </li>
        ))}
      </ul>

      {user && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire"
            required
          />
          <button type="submit">Commenter</button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
    </>
  );
}
