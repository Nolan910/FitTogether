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

Pour utiliser une autre URL en local sans modifier ces fichiers, créer un fichier `.env.development.local`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit la version de production |
| `npm run preview` | Sert la version construite |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm test` | Lance les tests (Vitest et React Testing Library) |

## Tests

Les tests tournent avec un `fetch` simulé : ils n'appellent jamais la vraie API. Ils couvrent :

- `api.js` : ajout du token, envoi en JSON ou en `FormData`, déconnexion sur une réponse 401, message en cas de coupure réseau ;
- `ProtectedRoute` : redirection sans session ou avec un token expiré, déconnexion quand l'API répond 401 ;
- le formulaire de connexion : retour sur la page demandée après connexion, affichage de l'erreur renvoyée par l'API.

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

## Environnements

| Environnement | Commande | API appelée | Configuration |
|---|---|---|---|
| Local | `npm run dev` | `http://localhost:3000` (API lancée en local) | `.env.development` |
| Tests (local et CI) | `npm test` | Aucune : `fetch` est simulé | `.env.test` |
| Production | Build Vercel (`npm run build`) | `https://fittogether-back.onrender.com` | `.env.production` |

## Déploiement

Le front est hébergé sur Vercel

### Procédure de mise en production

1. Créer une branche depuis `master`, développer, lancer `npm run lint` et `npm test` en local.
2. Pousser la branche et ouvrir une pull request vers `master` : la CI s'exécute et Vercel publie une prévisualisation.
3. Vérifier les écrans modifiés sur l'URL de prévisualisation (lien posté par Vercel dans la pull request).
4. Fusionner la pull request uniquement si la CI est verte : Vercel met alors la nouvelle version en production.
5. Réaliser une recette manuelle pour les fonctionnalités modifiées.

### Configuration initiale

**Vercel**

| Paramètre | Valeur |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Production branch | `master` |

### Retour à une version précédente (rollback)

Possibilité de revenir à une version précédente avec Vercel

## Veille

`npm audit` dans la CI et Dependabot signalent les failles et les mises à jour des dépendances.