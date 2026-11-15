import db from '../config/database.js';
import { successResponse } from '../utils/response.js';

export async function getStats(req, res) {
  const usersCount = await db.query('SELECT COUNT(*) as total FROM users');
  const sessionsCount = await db.query('SELECT COUNT(*) as total FROM coding_sessions');

  const totalUsers = usersCount[0]?.total || 0;
  const totalSessions = sessionsCount[0]?.total || 0;

  return successResponse(res, 'Admin statistics retrieved successfully', {
    total_users: totalUsers,
    total_sessions: totalSessions,
    total_ai_requests: totalSessions, // Phase 3 placeholder
  });
}

export async function listUsers(req, res) {
  const users = await db.query(
    'SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC'
  );

  return successResponse(res, 'User listing retrieved successfully', {
    users,
    total: users.length,
  });
}
