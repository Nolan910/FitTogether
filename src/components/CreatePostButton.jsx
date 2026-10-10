import { Link } from 'react-router-dom';

export default function CreatePostButton() {
  return (
    <Link to="/create-post" className="btn btn-primary">
      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Publier
    </Link>
  );
}
