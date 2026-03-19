# EduTech

Plataforma e-learning full‑stack con **React + Vite** en el frontend y **Express + PostgreSQL** en el backend.

## 🧩 Características principales

- ✅ Autenticación con **Google OAuth 2.0** (Passport)
- ✅ Control de acceso por roles (RBAC): **alumno**, **profesor**, **administrador**
- ✅ CRUD completo de **cursos**, **lecciones**, **tests** y **preguntas**
- ✅ Registro de resultados y calificaciones por usuario
- ✅ Panel de administración para **gestionar usuarios** (listar, cambiar rol, borrar)
- ✅ SPA React que consume la API (`/api/*`) con proxy integrado de Vite

## 🧰 Requisitos

- Node.js **18+**
- PostgreSQL

## 🗂 Estructura principal

- `/app.js` - servidor Express + API
- `/routes` - rutas REST (`/api/*` + `/auth/*`)
- `/controllers` - lógica de controlador
- `/services` - acceso a base de datos
- `/client/` - aplicación React (Vite)
- `/database/elearning_platform.sql` - esquema PostgreSQL inicial

## 🚀 Configuración local (desarrollo)

1. Clona el repositorio:
   ```bash
   git clone <repo-url>
   cd TFG_EduTech
   ```

2. Instala dependencias del backend:
   ```bash
   npm install
   ```

3. Instala dependencias del frontend:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Crea la base de datos y carga el esquema:
   - Crea una base (ej: `edutech_dev`)
   - Ejecuta el SQL en `database/elearning_platform.sql` en tu instancia PostgreSQL

5. Copia la plantilla de variables de entorno:
   ```bash
   cp .env.example .env
   ```

6. Rellena `.env` con tus valores (especialmente los de base de datos y Google OAuth):

   ```env
   # PostgreSQL
   DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>

   # Sesión
   SESSION_SECRET=una_clave_segura

   # Google OAuth (requerido para login)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

7. Arranca el backend y frontend en paralelo (desde la raíz del proyecto):
   ```bash
   npm run dev
   ```

   - Backend (API): http://localhost:3000
   - Frontend (React): http://localhost:5173

## 🔌 API Key Endpoints (principales)

El frontend consume la API a través del proxy de Vite (`/api/*`). Algunos endpoints clave:

- **Autenticación**
  - `GET /auth/google` → inicia logeo con Google
  - `GET /auth/google/callback` → callback OAuth
  - `GET /auth/logout` → cerrar sesión

- **Cursos**
  - `GET /api/courses` → lista pública de cursos
  - `POST /api/courses` → crea curso (profesor/administrador)
  - `PUT /api/courses/:id` → actualiza curso (dueño / admin)
  - `DELETE /api/courses/:id` → borra curso (dueño / admin)

- **Lecciones**
  - `GET /api/courses/:courseId/lessons`
  - `POST /api/courses/:courseId/lessons` (propietario)

- **Tests / Preguntas / Resultados**
  - `GET /api/tests`
  - `POST /api/courses/:courseId/tests` (propietario)
  - `POST /api/tests/:testId/submit` → envío de respuestas / cálculo de resultado

- **Usuarios (admin)**
  - `GET /api/users`
  - `PUT /api/users/:id/role` → cambiar rol
  - `DELETE /api/users/:id` → borrar usuario

## 🧪 Probar CORS / Proxy (desarrollo)

El frontend en `http://localhost:5173` hace peticiones a `/api/*` que se reenvían automáticamente a `http://localhost:3000` gracias al proxy de Vite (configurado en `client/vite.config.js`).

Si necesitas probar sin Vite, puedes llamar directo al backend:

```bash
curl http://localhost:3000/api/courses
```

## 📦 Producción (build)

1. Genera el build del frontend:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. El backend ya sirve los archivos estáticos de `client/dist` si existen.

3. Inicia el servidor en modo producción:
   ```bash
   npm start
   ```

## 🧹 Limpieza y notas

- El frontend es React + Vite.
- Backend expone solo APIs JSON y sirve el build de React en producción.

---

Si quieres que agreguemos funciones extra (notificaciones, pagos, roles por curso, etc.), dime y avanzamos juntos.
