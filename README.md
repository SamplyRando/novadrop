# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# NovaDrop – Déploiement production-ready

## Test Stripe en local

- Utilise les cartes de test Stripe pour simuler des paiements :
  - Carte Visa : `4242 4242 4242 4242` (date future, CVC aléatoire)
  - Plus de cartes : https://stripe.com/docs/testing
- Lance le front (`npm start`) et le backend (Vercel dev ou déploiement).
- Ajoute un produit au panier, procède au paiement, vérifie la redirection `/success`.
- La page de succès vérifie le paiement côté serveur (anti-fake success).

## Variables d’environnement à définir

### Stripe (obligatoire, côté serveur uniquement)
- `STRIPE_SECRET_KEY` : Clé secrète Stripe (jamais côté client)

### Supabase (optionnel, pour sauvegarde commandes)
- `SUPABASE_URL` : URL de ton projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (jamais côté client)

### Exemple (Vercel dashboard ou .env.local)
```
STRIPE_SECRET_KEY=sk_live_xxx
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## Création de la table commandes (Supabase)

Dans le SQL Editor de Supabase, exécute :

```sql
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  session_id text unique not null,
  email text,
  amount_total integer,
  currency text,
  items jsonb,
  status text
);
create index if not exists idx_orders_session_id on orders(session_id);
```

## Déploiement
- Push sur GitHub, connecte à Vercel, configure les variables d’environnement.
- `npm run build` doit fonctionner sans erreur.

## Sécurité
- Ne JAMAIS exposer la clé Stripe secrète ou la clé Supabase service role côté client.
- Les routes `/api/create-checkout-session` et `/api/confirm-payment` sont serverless (côté serveur uniquement).

## Flux de vente
- Panier persistant (localStorage)
- Paiement Stripe Checkout sécurisé
- Vérification du paiement côté serveur
- Sauvegarde de la commande (si Supabase configuré)
- Pages `/success` et `/cancel` fiables

## Dépendances nécessaires

Avant de déployer ou de builder le projet, assure-toi d'avoir installé toutes les dépendances nécessaires :

```
npm install react-router-dom
```

Si tu utilises Supabase pour la sauvegarde des commandes côté serveur :

```
npm install @supabase/supabase-js
```

Après installation, commit et push le `package.json` et le lockfile (`package-lock.json` ou `yarn.lock`).

---

Pour toute question, ouvre une issue sur le repo !
