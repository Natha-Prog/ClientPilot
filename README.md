# ClientPilot

CRM professionnel multi-utilisateurs — gestion de clients, prospects, tâches et notes.

## Prérequis

- Node.js 18+
- PostgreSQL 14+ (local ou via Docker)

## Installation rapide (Docker)

```bash
# 1. Cloner et installer
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Démarrer PostgreSQL
npm run db:up

# 4. Migrer et initialiser la base
npm run db:migrate
npm run db:seed

# 5. Lancer l'application
npm run dev
```

## Installation sans Docker (PostgreSQL local Windows)

Si PostgreSQL est déjà installé sur votre machine (port 5432) :

```powershell
# 1. Installer les dépendances
npm install
cp .env.example .env

# 2. Créer l'utilisateur et la base (en tant que postgres)
.\scripts\setup-local-db.ps1
# ou manuellement :
# psql -U postgres -h localhost -f scripts/setup-local-db.sql

# 3. Migrer, seed et lancer
npm run db:migrate
npm run db:seed
npm run dev
```

Le `.env` par défaut utilise `clientpilot:clientpilot@localhost:5432/clientpilot`.
Si vous préférez le superutilisateur local, modifiez `DATABASE_URL` (voir `.env.example`).

### Dépannage PostgreSQL local

| Erreur | Solution |
|--------|----------|
| `P1010 denied access` | Exécuter `scripts/setup-local-db.sql` ou corriger `DATABASE_URL` |
| `database does not exist` | Relancer le script SQL ci-dessus |
| `connection refused` | Démarrer le service Windows PostgreSQL |
| Conflit port 5432 avec Docker | Utiliser le local OU changer le port Docker à `5433` |

- **Frontend** : http://localhost:5173
- **API** : http://localhost:3001/api

## Compte administrateur

Par défaut (configurable dans `.env`) :
- Email : `admin@clientpilot.com`
- Mot de passe : `admin123`

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance client + serveur en parallèle |
| `npm run build` | Build production |
| `npm start` | Serveur production (sert aussi le frontend) |
| `npm run db:up` | Démarre PostgreSQL via Docker |
| `npm run db:setup-local` | Crée user + DB sur PostgreSQL local (Windows) |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:seed` | Crée l'admin initial |
| `npm run lint` | ESLint client + serveur |

## Architecture

```
ai-customer-service/
├── client/          # React + Vite + Tailwind
├── server/          # Express + Prisma + PostgreSQL
├── docker-compose.yml
└── .env.example
```

## Déploiement

### Option 1 : VPS + Docker

1. Cloner le repo sur le serveur
2. Copier `.env` avec des valeurs de production (`JWT_SECRET` fort, `NODE_ENV=production`)
3. `docker compose up -d`
4. `npm run build && npm start`

### Option 2 : Railway / Render (full stack)

1. Créer un service PostgreSQL (Neon, Railway, Supabase…)
2. Déployer le repo avec `DATABASE_URL` en variable d'environnement
3. Build command : `npm run build`
4. Start command : `npm start`
5. Exécuter une fois : `npm run db:migrate` puis `npm run db:seed`

### Option 3 : Vercel (frontend) + Railway / Render (API)

Architecture recommandée : le frontend React sur Vercel, l'API Express et PostgreSQL sur Railway ou Render.

#### Étape 1 — API + base de données (Railway ou Render)

1. Créer une base PostgreSQL (Neon, Railway, Supabase…)
2. Déployer le **repo entier** (racine du projet, pas `client/`)
3. Variables d'environnement :

| Variable | Exemple |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | chaîne aléatoire longue |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://client-pilot-qfkx.vercel.app` |

4. Build : `npm run build` — Start : `npm start`
5. Une fois déployé, lancer les migrations (shell Railway/Render ou en local avec la même `DATABASE_URL`) :

```bash
npm run db:migrate
npm run db:seed
```

6. Noter l'URL publique de l'API (ex. `https://clientpilot-api.railway.app`)

#### Étape 2 — Frontend sur Vercel

1. Importer le repo sur [vercel.com](https://vercel.com)
2. Paramètres du projet :

| Paramètre | Valeur |
|-----------|--------|
| Root Directory | *(laisser vide — le `vercel.json` à la racine build `client/`)* |
| Framework Preset | Vite |
| Build Command | `npm run build --prefix client` |
| Output Directory | `client/dist` |

> **Alternative :** définir Root Directory sur `client` (alors Build = `npm run build`, Output = `dist`). Ne pas mélanger les deux configurations.

3. Variable d'environnement Vercel :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://clientpilot-production.up.railway.app/api` |

4. Déployer. Après chaque changement de `VITE_API_URL`, redéployer (variable de build).

Le fichier `client/vercel.json` gère le routage SPA (React Router). Voir `client/.env.example` pour la liste des variables frontend.

#### Vérification

- L'URL Vercel doit être listée dans `CLIENT_URL` côté API (CORS + cookies JWT)
- L'API doit être en HTTPS (`NODE_ENV=production` active `secure` + `sameSite=none` sur les cookies)
- Tester la connexion avec le compte admin après le seed
- Si Vercel affiche `404: NOT_FOUND`, vérifier que le build a réussi et que Output Directory pointe vers `client/dist` (ou `dist` si Root Directory = `client`)

> **Accès immédiat :** l'app est déjà disponible en full-stack sur Railway : `https://clientpilot-production.up.railway.app`

## Fonctionnalités

- Authentification JWT sécurisée (bcrypt)
- Rôles admin / opérateur avec permissions
- CRUD clients, prospects, tâches, notes
- Conversion prospect → client
- Recherche globale, filtres, export CSV
- Dashboard avec KPIs et pipeline prospects
