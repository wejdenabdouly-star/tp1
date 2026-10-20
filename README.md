# TP1 — Application CRUD Full Stack (WSL2 Ubuntu)

Gestion de produits : **React (Vite)** + **FastAPI** + **PostgreSQL**.

```
tp1-crud/
├── backend/    API REST FastAPI + SQLAlchemy + tests pytest
└── frontend/   Interface React (Vite)
```

## 1. Prérequis (dans le terminal WSL2 Ubuntu)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql postgresql-contrib curl
# Node.js 20+ (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 20
```

> Travaillez dans le système de fichiers Linux (`~/tp1-crud`), pas dans `/mnt/c/...`.

## 2. Base de données PostgreSQL

```bash
sudo service postgresql start
sudo -u postgres psql <<'SQL'
CREATE USER tp1_user WITH PASSWORD 'tp1_password';
CREATE DATABASE tp1_db OWNER tp1_user;
SQL
```

La table `products` est créée automatiquement au démarrage du backend.

## 3. Backend (port 8000)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentation interactive : http://localhost:8000/docs

## 4. Frontend (port 5173)

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur Windows.

## 5. Tests CRUD

### a) Tests automatiques (pytest)
```bash
cd backend && source .venv/bin/activate
pytest -v
```
Ils utilisent une base SQLite temporaire : PostgreSQL n'est pas touchée.

### b) Tests manuels de l'API avec curl (PostgreSQL réelle)
```bash
# Ajouter
curl -X POST localhost:8000/api/products -H "Content-Type: application/json" \
  -d '{"name":"Clavier","description":"Mécanique","price":49.9,"quantity":10}'
# Lister
curl localhost:8000/api/products
# Consulter
curl localhost:8000/api/products/1
# Modifier
curl -X PUT localhost:8000/api/products/1 -H "Content-Type: application/json" \
  -d '{"name":"Clavier","description":"RGB","price":59,"quantity":5}'
# Supprimer
curl -X DELETE localhost:8000/api/products/1 -i
```

### c) Vérifier que les données sont dans PostgreSQL
```bash
sudo -u postgres psql -d tp1_db -c "SELECT * FROM products;"
```

## Endpoints

| Méthode | URL                    | Action                |
|---------|------------------------|-----------------------|
| POST    | /api/products          | Ajouter               |
| GET     | /api/products          | Lister                |
| GET     | /api/products/{id}     | Consulter             |
| PUT     | /api/products/{id}     | Modifier              |
| DELETE  | /api/products/{id}     | Supprimer             |

## Dépannage
- `connection refused` : `sudo service postgresql start`
- Erreur CORS : le frontend doit tourner sur le port 5173.
- Autre URL d'API : `VITE_API_URL=http://localhost:8000/api npm run dev`
# tp1
