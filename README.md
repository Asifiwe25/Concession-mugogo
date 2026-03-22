# 🌿 Concession Mugogo — ERP Agricole
> Système de gestion intégré pour exploitations agro-pastorales  
> **Multilingue : Français · Kiswahili · Mashi**

---

## 📁 Structure des dossiers

```
mugogo-erp/
├── frontend/                  ← Application React (interface utilisateur)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            ← Composants réutilisables (Button, Modal, Table...)
│   │   │   └── layout/        ← Sidebar, Layout principal
│   │   ├── pages/
│   │   │   ├── auth/          ← Login, Register
│   │   │   ├── dashboard/     ← Tableau de bord
│   │   │   ├── livestock/     ← Élevage + Ajout animal (wizard 5 étapes)
│   │   │   ├── employees/     ← RH + Ajout employé (wizard 4 étapes)
│   │   │   ├── tasks/         ← Kanban drag & drop
│   │   │   ├── finance/       ← Finance + Transactions + Budget
│   │   │   ├── stock/         ← Inventaire + Mouvements
│   │   │   ├── alerts/        ← Centre d'alertes
│   │   │   └── shared/        ← Pages Cultures, Récoltes, Rapports, Paramètres, Audit...
│   │   ├── context/           ← Store Zustand (auth)
│   │   ├── i18n/
│   │   │   └── locales/
│   │   │       ├── fr.json    ← Traductions Français
│   │   │       ├── sw.json    ← Traductions Kiswahili
│   │   │       └── mashi.json ← Traductions Mashi
│   │   └── services/
│   │       └── mockData.ts    ← Données de démo (remplacer par vraie API)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                   ← API Node.js / Express
│   ├── server.js              ← Point d'entrée
│   ├── .env.example           ← Variables d'environnement (copier en .env)
│   └── src/
│       ├── config/
│       │   └── database.js    ← Connexion PostgreSQL
│       ├── middleware/
│       │   └── auth.js        ← JWT + Rôles + Audit logs
│       └── routes/
│           ├── auth.js        ← Login, Register, Refresh token
│           ├── animals.js     ← CRUD complet + santé + vaccins + production
│           └── ...            ← Tous les autres modules
│
└── database/
    ├── migrations/
    │   └── 001_initial_schema.sql  ← Toutes les tables (30 tables!)
    └── seeds/
        └── 002_seed.sql            ← Données de test réalistes
```

---

## 🚀 Ouvrir dans VS Code

### 1. Télécharger le projet

Téléchargez et décompressez le projet, ou clonez depuis votre repo Git :

```bash
# Naviguer dans le dossier du projet
cd mugogo-erp

# Ouvrir dans VS Code
code .
```

### 2. Extensions VS Code recommandées

VS Code va proposer d'installer ces extensions automatiquement.  
Créez ce fichier `.vscode/extensions.json` :

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-azuretools.vscode-docker"
  ]
}
```

---

## ⚙️ Installation

### Prérequis

| Outil | Version | Télécharger |
|-------|---------|-------------|
| Node.js | ≥ 18 | https://nodejs.org |
| PostgreSQL | ≥ 14 | https://postgresql.org |
| npm | ≥ 9 | inclus avec Node.js |

---

### 📦 Installer le Frontend

```bash
# Dans le terminal VS Code (Ctrl+`)
cd frontend

# Installer toutes les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ L'application s'ouvre sur : **http://localhost:3000**

---

### 📦 Installer le Backend

```bash
# Nouveau terminal (Ctrl+Shift+`)
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Puis **éditer `.env`** avec vos informations PostgreSQL :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mugogo_erp
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE
JWT_SECRET=mugogo_secret_change_me_2025
```

```bash
# Démarrer le backend
npm run dev
```

✅ L'API tourne sur : **http://localhost:5000**  
✅ Test santé : http://localhost:5000/api/health

---

## 🗄️ Migration de la base de données

### Étape 1 — Créer la base de données

```bash
# Ouvrir psql (terminal PostgreSQL)
psql -U postgres

# Dans psql, créer la base :
CREATE DATABASE mugogo_erp;
\q
```

### Étape 2 — Exécuter la migration (créer toutes les tables)

```bash
# Depuis le dossier racine mugogo-erp/
psql -U postgres -d mugogo_erp -f database/migrations/001_initial_schema.sql
```

**Ce que ça crée :**
- ✅ 30 tables (concessions, zones, users, employees, animals, crops, harvests, stock, machines, tasks, transactions, alerts, audit...)
- ✅ 5 vues (v_animal_summary, v_monthly_production, v_finance_monthly, v_stock_alerts, v_attendance_summary)
- ✅ Triggers automatiques (alertes stock, alertes santé animale, updated_at)
- ✅ Index de performance
- ✅ Compte admin par défaut

### Étape 3 — Insérer les données de démonstration

```bash
psql -U postgres -d mugogo_erp -f database/seeds/002_seed.sql
```

**Ce que ça insère :**
- 7 zones géographiques
- 8 employés avec rôles variés
- 12 animaux (bovins, caprins, porcins, volailles)
- 4 cultures actives
- 12 articles de stock
- 5 machines
- 7 tâches (Kanban)
- 10 transactions financières
- 6 alertes

---

## 🔑 Connexion par défaut

| Champ | Valeur |
|-------|--------|
| Email | `admin@mugogo.cd` |
| Mot de passe | `Admin@2025` |
| Rôle | Super Administrateur |

> **Mode démo :** Entrez n'importe quel email + mot de passe pour accéder en mode démo (sans base de données).

---

## 🌍 Changer la langue

1. Sur l'écran de login → cliquer sur **🇫🇷 Français / 🇹🇿 Kiswahili / 🏔️ Mashi**
2. Dans l'application → bas de la sidebar → sélecteur de langue

---

## 📱 Pages disponibles

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Authentification multilingue |
| Dashboard | `/dashboard` | KPIs + graphiques + alertes |
| Employés | `/employees` | RH complet + wizard ajout |
| Élevage | `/livestock` | Cheptel + **wizard ajout animal 5 étapes** |
| Cultures | `/crops` | Gestion des cultures |
| Stock | `/stock` | Inventaire + seuils d'alerte |
| Tâches | `/tasks` | Kanban drag & drop |
| Finance | `/finance` | P&L + Transactions + Budget |
| Alertes | `/alerts` | Centre d'alertes triées |
| Rapports | `/reports` | Génération PDF/CSV |
| Paramètres | `/settings` | Configuration |
| Audit | `/audit` | Journal d'actions |

---

## 🔧 Commandes utiles

```bash
# Frontend
npm run dev        # Serveur développement (hot reload)
npm run build      # Build de production
npm run preview    # Prévisualiser le build

# Backend
npm run dev        # Serveur avec nodemon (auto-restart)
npm start          # Serveur production

# Base de données
# Voir toutes les tables :
psql -U postgres -d mugogo_erp -c "\dt"

# Voir les animaux :
psql -U postgres -d mugogo_erp -c "SELECT system_id, species, breed, local_name, health_status FROM animals;"

# Voir les alertes :
psql -U postgres -d mugogo_erp -c "SELECT type, title, status FROM alerts ORDER BY type;"

# Réinitialiser la base (ATTENTION: efface tout) :
psql -U postgres -c "DROP DATABASE IF EXISTS mugogo_erp; CREATE DATABASE mugogo_erp;"
psql -U postgres -d mugogo_erp -f database/migrations/001_initial_schema.sql
psql -U postgres -d mugogo_erp -f database/seeds/002_seed.sql
```

---

## 🏗️ Architecture

```
Navigateur ──→ React (Vite, port 3000)
                    ↓ API calls (/api/*)
             Node.js/Express (port 5000)
                    ↓ SQL queries
             PostgreSQL (port 5432)
```

---

## 📋 Modules & État

| Module | Frontend | Backend | DB |
|--------|----------|---------|-----|
| Auth | ✅ Complet | ✅ JWT | ✅ |
| Dashboard | ✅ Complet | ✅ Stats | ✅ |
| Employés | ✅ Complet | ✅ CRUD | ✅ |
| Élevage | ✅ Complet + Wizard | ✅ CRUD complet | ✅ |
| Cultures | 🔨 En cours | ✅ CRUD | ✅ |
| Récoltes | 🔨 En cours | ✅ CRUD | ✅ |
| Stock | ✅ Complet | ✅ CRUD | ✅ |
| Machines | 🔨 En cours | ✅ CRUD | ✅ |
| Tâches | ✅ Kanban | ✅ CRUD | ✅ |
| Finance | ✅ Complet | ✅ CRUD | ✅ |
| Alertes | ✅ Complet | ✅ CRUD | ✅ |
| Rapports | ✅ Interface | ✅ Endpoints | ✅ |
| Paramètres | ✅ Interface | ✅ Partiel | ✅ |
| Audit | ✅ Complet | ✅ Logs | ✅ |
| Multilingue | ✅ FR/SW/MASHI | — | — |

---

## 🤝 Support

Système développé pour la Concession Mugogo, Sud-Kivu, RDC.  
ERP Agricole — Version 1.0.0 — 2025
