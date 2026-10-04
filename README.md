# FitTogether

[![CI](https://github.com/Nolan910/FitTogether/actions/workflows/ci.yml/badge.svg)](https://github.com/Nolan910/FitTogether/actions/workflows/ci.yml)

Application sportive pour trouver des partenaires de sport, publier des photos de ses séances et discuter avec ses partenaires.

API : [FitTogether-CDA](https://github.com/Nolan910/FitTogether-CDA)

## Stack

- **React 19** et **Vite**
- **React Router 7**
- **jwt-decode** pour lire la date d'expiration du token

## Installation

```bash
npm install
```

## Configuration

L'URL de l'API est lue dans la variable `VITE_API_URL` :

| Fichier | Utilisé par | Valeur |
|---|---|---|
| `.env.development` | `npm run dev` | `http://localhost:3000` (API lancée en local) |
| `.env.production` | `npm run build` (Vercel) | `https://fittogether-back.onrender.com` |

Pour utiliser une autre URL en local sans modifier ces fichiers, créer un fichier `.env.development.local` (ignoré par Git).

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit la version de production |
| `npm run preview` | Sert la version construite |
| `npm run lint` | Vérifie le code avec ESLint |

## Architecture

```
src/
  api.js                  Client HTTP : URL de l'API, token, gestion des erreurs
  hooks/
    AuthContext.jsx       Contexte d'authentification
    AuthProvider.jsx      Session (token et utilisateur), connexion, déconnexion
    useAuth.js            Accès à la session depuis les composants
  components/
    ProtectedRoute.jsx    Redirige vers /login si l'utilisateur n'est pas connecté
    ...
  pages/                  Une page par route
  styles/                 Feuilles de style
```

## Authentification

- À la connexion, le token et l'utilisateur sont stockés dans le `localStorage` et dans le contexte `AuthProvider`.
- `api.js` ajoute automatiquement l'en-tête `Authorization: Bearer <token>` à chaque requête.
- La session est fermée automatiquement à l'expiration du token, ou dès que l'API répond 401.
- Les pages `/profil`, `/user/:id`, `/create-post` et `/chat` sont protégées par `ProtectedRoute`. Après la connexion, l'utilisateur revient sur la page qu'il voulait ouvrir.

## Intégration et déploiement continus

- **CI (GitHub Actions)** : à chaque push et à chaque pull request sur `master`, le workflow `.github/workflows/ci.yml` installe les dépendances, lance ESLint puis construit l'application.
- **CD (Vercel)** : le front est redéployé automatiquement à chaque push sur `master`. Chaque pull request reçoit aussi un déploiement de prévisualisation.
