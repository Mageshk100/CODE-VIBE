import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

export async function runMigrations() {
  const dbName = process.env.DB_NAME || 'code_vibe';
  const host   = process.env.DB_HOST || 'localhost';
  const port   = parseInt(process.env.DB_PORT || '3306', 10);
  const user   = process.env.DB_USER || 'root';
  const pass   = process.env.DB_PASSWORD || '';

  console.log(`[Migration] Connecting to MySQL at ${host}:${port}, database: "${dbName}"`);

  // Connect directly to the target database (DB_NAME).
  // The SQL file no longer contains CREATE DATABASE / USE statements,
  // so this works correctly on both local MySQL and managed hosts (Railway, etc.).
  const config = {
    host,
    port,
    user,
    password: pass,
    database: dbName,
    multipleStatements: true,
  };

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('[Migration] Connected. Running migration schema 001_create_tables.sql...');

    const sqlFilePath = path.join(__dirname, '001_create_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    await connection.query(sql);

    // Verify created tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('[Migration] Tables verified in database:', tableNames.join(', '));

    return tableNames;
  } catch (err) {
    console.error(`[Migration Error] ${err.message}`);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
