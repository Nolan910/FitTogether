import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import useAuth from '../hooks/useAuth';
import '../styles/PostDetail.css'; 
import ConfirmModal from '../components/ConfirmModal';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  //Récupération du post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`https://fittogether-back.onrender.com/post/${id}`);
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

  //Envoi de commentaire
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`https://fittogether-back.onrender.com/post/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          authorId: user._id,
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

  //Suppression de commentaire
  const handleDeleteComment = (commentId) => {
  setCommentToDelete(commentId);
  setShowModal(true);
  };

  const confirmDeleteComment  = async () => {
  if (!commentToDelete) return;
  try {
    const res = await fetch(`https://fittogether-back.onrender.com/comments/${commentToDelete}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentToDelete),
      }));   
    } else {
      console.error("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setShowModal(false);
    setCommentToDelete(null);
  }
};

  if (loading) return <p>Chargement...</p>;
  if (!post) return <p>Post introuvable</p>;

  return (
    <>
    <div className="page-container">
      <Header />
    
      <div className="post-detail">
        <div className="post-author">
          <img src={post.author.profilPic} alt={`Photo de profil de ${post.author.name}`} className="author-picture" />
          <h2>{post.author.name}</h2>
        </div>
        <h3 className="post-description">{post.description}</h3>
        <img className="post-image" src={post.imageUrl} alt="Photo du poste" />
        
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
        <h2>Commentaires</h2>
        {post.comments.length === 0 ? (
          <p className="no-comments">Pas de commentaires pour l'instant.</p>
        ) : (
          <ul className="comments-list">
            {post.comments.map((comment) => (
              <li key={comment._id} className="comment-item">
                <div className="comment-header">
                  <img
                    src={comment.author?.profilPic || '/default-avatar.png'}
                    alt={`Profil de ${comment.author?.name || 'utilisateur'}`}
                    className="comment-avatar"
                  />
                  <div>
                    <strong>{comment.author?.name}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className='comment-content'>{comment.content}</p>
                {user && comment.author && (comment.author._id === user._id || comment.author === user._id) && (
                  <button onClick={() => handleDeleteComment(comment._id)} className="delete-comment-btn">
                    Supprimer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
     {showModal && (
      <ConfirmModal
        message="Supprimer ce commentaire ?"
        onConfirm={confirmDeleteComment}
        onCancel={() => setShowModal(false)}
      />
    )}
    </>
  );
}
