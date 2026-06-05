import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db.js';

const pgSession = connectPgSimple(session);

const IN_PROD = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  throw new Error('Falta SESSION_SECRET en el .env: es obligatorio para firmar las cookies de sesión.');
}

// Almacén de sesiones en PostgreSQL (reutiliza el pool de la app).
// Persiste las sesiones entre reinicios y evita la fuga de memoria del
// MemoryStore por defecto, sin añadir infraestructura extra.
const store = new pgSession({
  pool,
  tableName: 'session',
  createTableIfMissing: true
});

const sessionConfig = {
  store,
  name: 'edutech.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IN_PROD,
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
};

export { sessionConfig };
