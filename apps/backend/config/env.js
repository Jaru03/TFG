import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// En ESM los `import` se evalúan antes que el resto del código, así que la
// carga de variables de entorno se aísla en este módulo y se importa el
// primero de todos en app.js. Así config/db.js y config/session.js ya
// encuentran process.env poblado cuando se evalúan.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// El .env vive en la raíz del monorepo (tres niveles por encima de /config).
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Construir DATABASE_URL para Prisma a partir de las variables individuales si no está definida.
if (!process.env.DATABASE_URL) {
  const { DB_USER = 'postgres', DB_PASSWORD = '', DB_HOST = 'localhost', DB_PORT = '5432', DB_NAME = 'elearning_platform' } = process.env;
  const pwd = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
  process.env.DATABASE_URL = `postgresql://${DB_USER}${pwd}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}
