import { Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Avatar from './Avatar';
import '../styles/Header.css';

export default function Header() {
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand">
            <img src="/logo-96.png" alt="" width="32" height="32" className="brand-logo" />
            FitTogether
          </Link>

          <nav aria-label="Navigation principale">
            {isLoggedIn && user ? (
              <ul className="nav-list">
                <li>
                  <NavLink to="/chat" className="btn btn-ghost">Messages</NavLink>
                </li>
                <li>
                  <NavLink to="/profil" className="nav-profile">
                    <Avatar src={user.profilPic} name={user.name} size={32} />
                    <span className="nav-profile-name">{user.name}</span>
                    <span className="sr-only"> : mon profil</span>
                  </NavLink>
                </li>
              </ul>
            ) : (
              <ul className="nav-list">
                <li>
                  <NavLink to="/login" className="btn btn-secondary">Connexion</NavLink>
                </li>
                <li>
                  <NavLink to="/inscription" className="btn btn-primary">Inscription</NavLink>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
