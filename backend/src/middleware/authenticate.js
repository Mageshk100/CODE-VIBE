import { verifyToken } from '../config/firebase.js';
import db from '../config/database.js';
import { errorResponse } from '../utils/response.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required: missing or invalid Authorization header', 401);
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      return errorResponse(res, 'Authentication required: Bearer token is empty', 401);
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (tokenErr) {
      return errorResponse(res, `Authentication failed: ${tokenErr.message}`, 401);
    }

    const firebaseUid = decoded.uid;
    const email = decoded.email;
    const displayName = decoded.name || email?.split('@')[0] || 'Student';

    if (!firebaseUid) {
      return errorResponse(res, 'Invalid token: missing Firebase UID', 401);
    }

    // Lookup user in MySQL
    let users = await db.query('SELECT * FROM users WHERE firebase_uid = ?', [firebaseUid]);
    let user = users[0];

    // If user does not exist in MySQL yet, synchronize profile automatically with default 'student' role
    if (!user) {
      try {
        const result = await db.query(
          'INSERT INTO users (firebase_uid, email, display_name, role) VALUES (?, ?, ?, ?)',
          [firebaseUid, email || `${firebaseUid}@codevibe.app`, displayName, 'student']
        );
        users = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = users[0];
      } catch (insertErr) {
        // If email already existed with another UID, find by email
        if (insertErr.code === 'ER_DUP_ENTRY' && email) {
          users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
          user = users[0];
        } else {
          throw insertErr;
        }
      }
    }

    if (!user) {
      return errorResponse(res, 'User profile could not be synchronized with MySQL', 401);
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err.message);
    return errorResponse(res, 'Internal authentication error', 500);
  }
}
