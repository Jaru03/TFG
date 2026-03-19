require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const { sessionConfig } = require('./config/session');
require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const apiAuthRoutes = require('./routes/api/auth.routes');
const apiCourseRoutes = require('./routes/api/courses.routes');
const apiUsersRoutes = require('./routes/api/users.routes');
const apiLessonsRoutes = require('./routes/api/lessons.routes');
const apiTestsRoutes = require('./routes/api/tests.routes');
const apiQuestionsRoutes = require('./routes/api/questions.routes');
const apiResultsRoutes = require('./routes/api/results.routes');

const app = express();

// CORS (solo para desarrollo con Vite)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

// Body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session
app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Rutas de API
app.use('/api/auth', apiAuthRoutes);
app.use('/api/courses', apiCourseRoutes);
app.use('/api/courses/:courseId/lessons', apiLessonsRoutes);
app.use('/api/courses/:courseId/tests', apiTestsRoutes);
app.use('/api/tests/:testId/questions', apiQuestionsRoutes);
app.use('/api/users', apiUsersRoutes);
app.use('/api/results', apiResultsRoutes);

// Rutas de autenticación / sesión
app.use('/auth', authRoutes);


// En producción servir React build
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // 404 handler para el backend
  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EduTech running on http://localhost:${PORT}`);
});
