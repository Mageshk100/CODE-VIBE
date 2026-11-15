import db from '../src/config/database.js';
import dotenv from 'dotenv';
dotenv.config();

async function provisionAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: node scripts/createAdmin.js <user-email>');
    console.log('Example: node scripts/createAdmin.js admin@codevibe.app');
    process.exit(1);
  }

  console.log(`[Admin Provisioning] Searching for user with email: ${email}...`);

  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      console.log(`[Admin Provisioning] User not found. Provisioning fresh admin profile for ${email}...`);
      const result = await db.query(
        'INSERT INTO users (firebase_uid, email, display_name, role) VALUES (?, ?, ?, ?)',
        [`admin-uid-${Date.now()}`, email, 'Code Vibe Administrator', 'admin']
      );
      console.log(`[Admin Provisioning] Success! Created new admin user with ID: ${result.insertId}`);
    } else {
      await db.query('UPDATE users SET role = ?, updated_at = NOW() WHERE email = ?', ['admin', email]);
      console.log(`[Admin Provisioning] Success! Promoted ${email} (ID: ${user.id}) to role: admin`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[Admin Provisioning Error]:', err.message);
    process.exit(1);
  }
}

provisionAdmin();
