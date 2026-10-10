import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const formatDate = (value) => new Date(value).toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function PostCard({ post, headingLevel = 2, linkAuthor = true, currentUserId, onDelete }) {
  const Heading = `h${headingLevel}`;
  const author = post.author || {};
  const showAuthorLink = linkAuthor && author._id && author._id !== currentUserId;
  const authorContent = (
    <>
      <Avatar src={author.profilPic} name={author.name} size={22} />
      {author.name}
    </>
  );

  return (
    <article className="post-card">
      <img className="post-card-media" src={post.imageUrl} alt={post.description} loading="lazy" />
      <div className="post-card-body">
        <Heading className="post-card-title">
          <Link to={`/post/${post._id}`}>{post.description}</Link>
        </Heading>
        <p className="post-meta">
          {showAuthorLink ? (
            <Link to={`/user/${author._id}`}>{authorContent}</Link>
          ) : (
            <span className="post-author">{authorContent}</span>
          )}
          <span aria-hidden="true">·</span>
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </p>
      </div>
      {onDelete && (
        <div className="post-card-actions">
          <button
            type="button"
            className="btn btn-link-danger btn-sm"
            onClick={() => onDelete(post._id)}
            aria-label={`Supprimer le post « ${post.description} »`}
          >
            Supprimer
          </button>
        </div>
      )}
    </article>
  );
}
