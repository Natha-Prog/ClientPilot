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

### Option 2 : Railway / Render

1. Créer un service PostgreSQL
2. Déployer le repo avec `DATABASE_URL` en variable d'environnement
3. Build command : `npm run build`
4. Start command : `npm start`

## Fonctionnalités

- Authentification JWT sécurisée (bcrypt)
- Rôles admin / opérateur avec permissions
- CRUD clients, prospects, tâches, notes
- Conversion prospect → client
- Recherche globale, filtres, export CSV
- Dashboard avec KPIs et pipeline prospects
