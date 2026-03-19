const { Pool } = require('pg');

const poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'elearning_platform';
}

// Permitir conectar en entornos con SSL (por ejemplo, servicios en la nube).
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

poolConfig.max = 10;
poolConfig.idleTimeoutMillis = 30000;

const pool = new Pool(poolConfig);

async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

module.exports = { pool, query };