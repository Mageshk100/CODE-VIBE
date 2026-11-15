import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyMySQL() {
  console.log('\n======================================================');
  console.log('   MYSQL REAL DATABASE VERIFICATION TEST');
  console.log('======================================================\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'code_vibe',
  };

  console.log(`[Config] Connecting to ${config.user}@${config.host}:${config.port}/${config.database}`);

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('✓ PASS: Connected directly to MySQL database');

    // 1. Check Tables
    const [tables] = await conn.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0]);
    console.log('[Tables Found]:', tableList.join(', '));

    const requiredTables = ['users', 'coding_sessions', 'chat_messages'];
    for (const reqTable of requiredTables) {
      if (tableList.includes(reqTable)) {
        console.log(`✓ PASS: Table '${reqTable}' exists`);
      } else {
        throw new Error(`FAIL: Missing required table '${reqTable}'`);
      }
    }

    // 2. Check Foreign Keys
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [config.database]);

    console.log('\n[Foreign Keys Verified]:');
    for (const fk of fks) {
      console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
    }

    const hasSessionUserFk = fks.some(f => f.TABLE_NAME === 'coding_sessions' && f.COLUMN_NAME === 'user_id' && f.REFERENCED_TABLE_NAME === 'users');
    const hasMessageSessionFk = fks.some(f => f.TABLE_NAME === 'chat_messages' && f.COLUMN_NAME === 'session_id' && f.REFERENCED_TABLE_NAME === 'coding_sessions');

    if (!hasSessionUserFk) throw new Error('FAIL: Foreign key coding_sessions.user_id -> users.id missing');
    if (!hasMessageSessionFk) throw new Error('FAIL: Foreign key chat_messages.session_id -> coding_sessions.id missing');
    console.log('✓ PASS: Foreign keys correctly configured');

    // 3. Test Real CRUD Lifecycle
    console.log('\n[CRUD Lifecycle Test]:');
    const testUid = 'test-uid-' + Date.now();
    const testEmail = `student-${Date.now()}@test.edu`;

    // Insert user
    const [uRes] = await conn.query(
      'INSERT INTO users (firebase_uid, email, display_name, role) VALUES (?, ?, ?, ?)',
      [testUid, testEmail, 'Real MySQL Student', 'student']
    );
    const userId = uRes.insertId;
    console.log(`✓ PASS: Created test user record (ID: ${userId})`);

    // Insert session
    const [sRes] = await conn.query(
      'INSERT INTO coding_sessions (user_id, title, language, original_code, explanation) VALUES (?, ?, ?, ?, ?)',
      [userId, 'Java – Binary Search', 'java', 'public static int search() {}', JSON.stringify({ overview: 'Test explanation' })]
    );
    const sessionId = sRes.insertId;
    console.log(`✓ PASS: Created coding session record (ID: ${sessionId})`);

    // Insert chat message
    const [mRes] = await conn.query(
      'INSERT INTO chat_messages (session_id, role, message) VALUES (?, ?, ?)',
      [sessionId, 'user', 'What is the time complexity?']
    );
    const messageId = mRes.insertId;
    console.log(`✓ PASS: Created chat message record (ID: ${messageId})`);

    // Retrieve and verify
    const [retrieved] = await conn.query('SELECT * FROM coding_sessions WHERE id = ?', [sessionId]);
    if (retrieved.length === 0 || retrieved[0].title !== 'Java – Binary Search') {
      throw new Error('FAIL: Failed to retrieve created session');
    }
    console.log('✓ PASS: Successfully retrieved coding session from MySQL');

    const [retrievedMsgs] = await conn.query('SELECT * FROM chat_messages WHERE session_id = ?', [sessionId]);
    if (retrievedMsgs.length === 0 || retrievedMsgs[0].message !== 'What is the time complexity?') {
      throw new Error('FAIL: Failed to retrieve chat messages from MySQL');
    }
    console.log('✓ PASS: Successfully retrieved chat message from MySQL');

    // Clean up test data (cascade delete from user will cascade to session and messages)
    await conn.query('DELETE FROM users WHERE id = ?', [userId]);
    const [checkDeleted] = await conn.query('SELECT * FROM coding_sessions WHERE id = ?', [sessionId]);
    if (checkDeleted.length > 0) {
      throw new Error('FAIL: ON DELETE CASCADE did not remove child session');
    }
    console.log('✓ PASS: ON DELETE CASCADE verified (deleted user cleaned up session and messages)');

    console.log('\n======================================================');
    console.log('  ALL MYSQL VERIFICATION CHECKS PASSED');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n✗ FAIL:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

verifyMySQL();
