// La carga del .env debe ir la primera: al estar en su propio módulo se
// evalúa antes que config/db.js y config/session.js, que leen process.env.
import './config/env.js';

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';

import { sessionConfig } from './config/session.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import './config/passport.js';

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import apiAuthRoutes from './routes/api/auth.routes.js';
import apiCourseRoutes from './routes/api/courses.routes.js';
import apiUsersRoutes from './routes/api/users.routes.js';
import apiLessonsRoutes from './routes/api/lessons.routes.js';
import apiTestsRoutes from './routes/api/tests.routes.js';
import apiQuestionsRoutes from './routes/api/questions.routes.js';
import apiResultsRoutes from './routes/api/results.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Detrás del proxy inverso (Nginx) se confía en la primera cabecera
// X-Forwarded-Proto. Es necesario para que express-session emita la cookie
// `secure` cuando la conexión original del cliente es HTTPS.
app.set('trust proxy', 1);

// CORS
const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session
app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Rutas de API
app.use('/api/auth', apiAuthRoutes);
app.use('/api/courses', apiCourseRoutes);
app.use('/api/courses/:courseId/lessons', apiLessonsRoutes);
app.use('/api/lessons', apiLessonsRoutes);
app.use('/api/courses/:courseId/tests', apiTestsRoutes);
app.use('/api/tests', apiTestsRoutes);
app.use('/api/tests/:testId/questions', apiQuestionsRoutes);
app.use('/api/users', apiUsersRoutes);
app.use('/api/results', apiResultsRoutes);

// Rutas de autenticación / sesión
app.use('/auth', authRoutes);

// Rutas de backoffice admin
app.use('/api/admin', adminRoutes);


// En producción servir React build
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(buildPath));
  // Las rutas de API/Auth no resueltas devuelven 404 JSON, no el index.html del SPA.
  app.use(['/api', '/auth'], notFound);
  // Cualquier otra ruta sirve la SPA (React Router se encarga del enrutado).
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // 404 para rutas no encontradas, con formato JSON consistente.
  app.use(notFound);
}

// Manejador de errores global. Debe ir el último, después de las rutas.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EduTech running on http://localhost:${PORT}`);
});
