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
| `npm test` | Lance les tests (Vitest et React Testing Library) |

## Tests

Les tests tournent dans un DOM simulé (jsdom), avec un `fetch` simulé : ils n'appellent jamais la vraie API. Ils couvrent :

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

Ces fichiers ne contiennent que l'URL publique de l'API, aucun secret : tout ce qui est préfixé par `VITE_` est inclus dans le code envoyé au navigateur et ne doit donc jamais contenir de clé.

## Déploiement

Le front est hébergé sur **Vercel** : un site statique (le dossier `dist/` produit par Vite) servi par un CDN.

### Pipeline

| Étape | Déclenchement | Contenu |
|---|---|---|
| CI (`.github/workflows/ci.yml`) | Push et pull request sur `master` | `npm ci` → `npm audit --omit=dev --audit-level=critical` → ESLint → tests → build |
| Prévisualisation Vercel | Chaque pull request | Un déploiement de test avec sa propre URL, pour vérifier les changements avant fusion |
| Production Vercel | Push sur `master` | `npm run build`, puis mise en ligne |
| Dependabot (`.github/dependabot.yml`) | Chaque semaine | Pull requests de mise à jour des dépendances npm et des actions GitHub |

### Procédure de mise en production

1. Créer une branche depuis `master`, développer, lancer `npm run lint` et `npm test` en local.
2. Pousser la branche et ouvrir une pull request vers `master` : la CI s'exécute et Vercel publie une prévisualisation.
3. Vérifier les écrans modifiés sur l'URL de prévisualisation (lien posté par Vercel dans la pull request).
4. Fusionner la pull request uniquement si la CI est verte : Vercel met alors la nouvelle version en production.
5. Vérifier le site en ligne : page d'accueil, connexion, et une page profonde rechargée (par exemple `/profil`) pour contrôler la réécriture des routes.
6. Dérouler la recette manuelle pour les fonctionnalités modifiées.

Vercel déploie la production à chaque push sur `master` sans attendre la CI. C'est la protection de la branche `master` (fusion uniquement par pull request avec la CI verte) qui empêche du code non testé d'arriver en production. Seul l'administrateur du dépôt peut la contourner pour pousser directement : dans ce cas, la CI s'exécute après coup, et un échec se corrige par un rollback Vercel.

### Configuration initiale (une seule fois)

**Vercel**

| Paramètre | Valeur |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22 (lu dans `engines`) |
| Production branch | `master` |

`vercel.json` redirige toutes les routes vers `index.html` : sans cette règle, recharger une page comme `/profil` renverrait une erreur 404, car le routage est fait par React Router dans le navigateur.

**API** : l'URL du front doit figurer dans les origines autorisées par l'API (`allowedOrigins` dans `app.js` du dépôt FitTogether-CDA), sinon les appels sont bloqués par CORS.

**GitHub** : protéger `master` par un ruleset (*Settings* → *Rules* → *Rulesets*) : suppression et force-push interdits, fusion uniquement par pull request, job *Lint, tests et build* obligatoirement vert. L'administrateur du dépôt figure dans la liste de contournement (*bypass*).

### Retour à une version précédente (rollback)

- **Rapide** : Vercel → onglet *Deployments* → choisir le dernier déploiement qui fonctionnait → *Instant Rollback* (ou *Promote to Production*).
- **Durable** : `git revert <commit>` puis push sur `master`.

### En cas d'incident

| Symptôme | Cause probable | Action |
|---|---|---|
| Page blanche | Erreur JavaScript au chargement | Console du navigateur, logs de build Vercel ; rollback si besoin |
| 404 en rechargeant une page | Réécriture absente | Vérifier `vercel.json` |
| « Erreur réseau » partout | API en veille, arrêtée ou bloquée par CORS | Appeler `https://fittogether-back.onrender.com/health` ; vérifier `allowedOrigins` côté API |
| Déconnexion immédiate après connexion | Token refusé par l'API (401) | Vérifier que `VITE_API_URL` pointe vers la bonne API |

## Veille

`npm audit` dans la CI et Dependabot signalent les failles et les mises à jour des dépendances. Sources suivies : [CERT-FR](https://www.cert.ssi.gouv.fr/), [OWASP Top 10](https://owasp.org/www-project-top-ten/), [blog React](https://react.dev/blog), [GitHub Advisory Database](https://github.com/advisories).
