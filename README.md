# EduTech

Plataforma e-learning full‑stack con **React + Vite** en el frontend y **Express + PostgreSQL** en el backend, organizada como **monorepo con npm workspaces**.

## 🧩 Características principales

- ✅ Autenticación con **Google OAuth 2.0** (Passport)
- ✅ Control de acceso por roles (RBAC): **alumno**, **profesor**, **administrador**
- ✅ CRUD completo de **cursos**, **lecciones**, **tests** y **preguntas**
- ✅ Registro de resultados y calificaciones por usuario
- ✅ Panel de administración para **gestionar usuarios** (listar, cambiar rol, borrar)
- ✅ SPA React que consume la API (`/api/*`) con proxy integrado de Vite

## 🧰 Requisitos

- Node.js **18+**
- Docker (para la base de datos PostgreSQL)

## 🗂 Estructura del monorepo

```
TFG/
├── apps/
│   ├── backend/          # Servidor Express + API REST
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── client/           # Aplicación React (Vite)
│       ├── src/
│       └── vite.config.js
├── .env                  # Variables de entorno compartidas
├── docker-compose.yml    # Base de datos PostgreSQL
├── package.json          # Raíz del monorepo (workspaces)
└── package-lock.json
```

Las dependencias de todos los workspaces se instalan en el `node_modules` raíz mediante **npm workspaces**. No hay `node_modules` individuales por app.

## 🚀 Configuración local (desarrollo)

### 1. Instalar dependencias

Desde la raíz del proyecto (instala todo de una vez):

```bash
npm install
```

### 2. Variables de entorno

Crea un `.env` en la raíz con:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=elearning_platform

# Sesión
SESSION_SECRET=una_clave_segura

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend (para redirecciones tras login/logout)
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Arrancar la base de datos

```bash
docker compose up -d
```

Esto levanta PostgreSQL 17 en el puerto `5434` e inicializa el esquema automáticamente.

### 4. Arrancar backend y frontend en paralelo

```bash
npm run dev
```

- Backend (API): http://localhost:3000
- Frontend (React): http://localhost:5173

## 🔌 Google OAuth — URIs autorizadas

En Google Cloud Console configura:

- **Origen JavaScript autorizado:** `http://localhost:3000`
- **URI de redireccionamiento autorizado:** `http://localhost:3000/auth/google/callback`

## 🔌 API — Endpoints principales

- **Autenticación**
  - `GET /auth/google` → inicia login con Google
  - `GET /auth/google/callback` → callback OAuth
  - `GET /auth/logout` → cerrar sesión

- **Cursos**
  - `GET /api/courses`
  - `POST /api/courses` (profesor/admin)
  - `PUT /api/courses/:id` (propietario/admin)
  - `DELETE /api/courses/:id` (propietario/admin)

- **Lecciones**
  - `GET /api/courses/:courseId/lessons`
  - `POST /api/courses/:courseId/lessons` (propietario)

- **Tests / Preguntas / Resultados**
  - `GET /api/tests`
  - `POST /api/courses/:courseId/tests` (propietario)
  - `POST /api/tests/:testId/submit`

- **Usuarios (admin)**
  - `GET /api/users`
  - `PUT /api/users/:id/role`
  - `DELETE /api/users/:id`

## 📦 Producción

```bash
# Build del frontend
npm run client:build

# Arrancar en producción (el backend sirve el build de React)
npm -w edutech run start
```

## 🧹 Scripts disponibles (raíz)

| Script | Descripción |
|---|---|
| `npm run dev` | Arranca backend + frontend en paralelo |
| `npm run server` | Solo el backend (nodemon) |
| `npm run client:dev` | Solo el frontend (Vite) |
| `npm run client:build` | Build de producción del frontend |
| `npm run client:start` | Preview del build de producción |
