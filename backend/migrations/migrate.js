import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

export async function runMigrations() {
  console.log('[Migration] Connecting to MySQL...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'code_vibe',
    multipleStatements: true,
  };

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log(`[Migration] Successfully connected to MySQL at ${config.host}:${config.port}/${config.database}`);

    const sqlFilePath = path.join(__dirname, '001_create_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('[Migration] Executing migration schema 001_create_tables.sql...');
    await connection.query(sql);

    // Verify created tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('[Migration] Verified tables in database:', tableNames.join(', '));

    return tableNames;
  } catch (err) {
    console.error(`[Migration Error] Failed to run migrations: ${err.message}`);
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
