import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'code_vibe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

let pool = null;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.error('[Database] Failed to initialize MySQL connection pool:', err.message);
  pool = null;
}

/**
 * Execute parameterized query directly against real MySQL
 * Throws error if connection fails (no in-memory substitution)
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('MySQL connection pool is not initialized. Please verify MySQL configuration in backend/.env');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Obtain a dedicated connection from the MySQL pool
 */
export async function getConnection() {
  if (!pool) {
    throw new Error('MySQL connection pool is not initialized. Please verify MySQL configuration in backend/.env');
  }
  return await pool.getConnection();
}

/**
 * Check real MySQL database health
 */
export async function checkDbHealth() {
  if (!pool) {
    return {
      status: 'offline',
      driver: 'mysql2',
      error: 'Connection pool not initialized',
    };
  }
  try {
    await pool.query('SELECT 1');
    return {
      status: 'healthy',
      driver: 'mysql2',
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
    };
  } catch (err) {
    return {
      status: 'offline',
      driver: 'mysql2',
      error: err.message,
      code: err.code,
    };
  }
}

export default {
  query,
  getConnection,
  checkDbHealth,
};
