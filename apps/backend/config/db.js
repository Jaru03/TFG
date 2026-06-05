import pg from 'pg';

const { Pool } = pg;

// Pool de pg exclusivamente para connect-pg-simple (almacén de sesiones).
// Las queries de negocio usan config/prisma.js (Prisma Client).
const poolConfig = { connectionString: process.env.DATABASE_URL };

if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

poolConfig.max = 5;
poolConfig.idleTimeoutMillis = 30000;

const pool = new Pool(poolConfig);

export { pool };