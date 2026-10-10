import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';
import { cloudinarySrcSet, cloudinaryUrl } from '../utils/cloudinaryImage';
import '../styles/PostDetail.css';

const formatDateTime = (value) => new Date(value).toLocaleString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentToDelete, setCommentToDelete] = useState(null);
  usePageTitle(post ? post.description : 'Post');

  //Récupération du post
  useEffect(() => {
    api(`/post/${id}`)
      .then(setPost)
      .catch(() => setError('Erreur lors du chargement du post'))
      .finally(() => setLoading(false));
  }, [id]);

  //Envoi de commentaire
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const data = await api(`/post/${id}/comment`, {
        method: 'POST',
        body: { content: newComment },
      });

      setPost((prev) => ({
        ...prev,
        comments: [data.comment, ...prev.comments],
      }));
      setNewComment('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  //Suppression de commentaire
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await api(`/comments/${commentToDelete}`, { method: 'DELETE' });
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentToDelete),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCommentToDelete(null);
    }
  };

  const author = post?.author || {};
  const isOwnPost = user && author._id === user._id;

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page">
        {loading && <p className="status" role="status">Chargement du post…</p>}

        {!loading && !post && (
          <div className="empty-state">
            <h1>Post introuvable</h1>
            <p>Ce post n'existe pas ou a été supprimé. <Link to="/">Retour au fil d'actualité</Link></p>
          </div>
        )}

        {post && (
          <div className="post-detail">
            <div className="post-detail-media">
              <img
                src={cloudinaryUrl(post.imageUrl, { width: 1280 })}
                srcSet={cloudinarySrcSet(post.imageUrl, [640, 960, 1280, 1920])}
                sizes="(min-width: 1120px) 640px, (min-width: 900px) 58vw, calc(100vw - 32px)"
                alt={post.description}
              />
            </div>

            <div className="card post-detail-panel">
              <div className="post-detail-author">
                <Avatar src={author.profilPic} name={author.name} size={44} />
                <div>
                  {isOwnPost ? (
                    <span className="post-detail-author-name">{author.name}</span>
                  ) : (
                    <Link to={`/user/${author._id}`} className="post-detail-author-name">{author.name}</Link>
                  )}
                  <p className="muted post-detail-date">
                    <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
                  </p>
                </div>
              </div>

              <h1 className="post-detail-title">{post.description}</h1>

              <section aria-labelledby="commentaires" className="comments">
                <h2 id="commentaires">Commentaires ({post.comments.length})</h2>

                {user ? (
                  <form onSubmit={handleCommentSubmit} className="comment-form">
                    <label htmlFor="new-comment" className="field-label">Ajouter un commentaire</label>
                    <textarea
                      id="new-comment"
                      className="input"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={500}
                      aria-describedby={error ? 'comment-error' : undefined}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Commenter</button>
                  </form>
                ) : (
                  <p className="muted"><Link to="/login" state={{ from: { pathname: `/post/${id}` } }}>Connectez-vous</Link> pour commenter.</p>
                )}

                {error && <p id="comment-error" className="alert alert-error" role="alert">{error}</p>}

                {post.comments.length === 0 ? (
                  <p className="muted">Pas de commentaires pour l'instant.</p>
                ) : (
                  <ul className="comments-list">
                    {post.comments.map((comment) => (
                      <li key={comment._id} className="comment-item">
                        <Avatar src={comment.author?.profilPic} name={comment.author?.name} size={32} />
                        <div className="comment-body">
                          <p className="comment-header">
                            <span className="comment-author">{comment.author?.name || 'Utilisateur supprimé'}</span>
                            <time dateTime={comment.createdAt} className="comment-date">{formatDateTime(comment.createdAt)}</time>
                          </p>
                          <p className="comment-content">{comment.content}</p>
                          {user && comment.author && (comment.author._id === user._id || user.isAdmin) && (
                            <button
                              type="button"
                              onClick={() => setCommentToDelete(comment._id)}
                              className="btn btn-link-danger btn-sm"
                              aria-label={`Supprimer le commentaire de ${comment.author.name}`}
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {commentToDelete && (
        <ConfirmModal
          title="Supprimer ce commentaire ?"
          message="Le commentaire sera définitivement supprimé."
          onConfirm={confirmDeleteComment}
          onCancel={() => setCommentToDelete(null)}
        />
      )}
    </>
  );
}
