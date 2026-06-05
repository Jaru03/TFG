import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Auto-construir DATABASE_URL desde las variables individuales si no existe
if (!process.env.DATABASE_URL) {
  const { DB_USER = 'postgres', DB_PASSWORD = '', DB_HOST = 'localhost', DB_PORT = '5432', DB_NAME = 'elearning_platform' } = process.env;
  const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
  process.env.DATABASE_URL = `postgresql://${DB_USER}${password}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
