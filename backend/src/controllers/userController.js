import db from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getProfile(req, res) {
  const user = req.user;
  const initials = user.display_name
    ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return successResponse(res, 'User profile retrieved successfully', {
    id: user.id,
    firebase_uid: user.firebase_uid,
    email: user.email,
    display_name: user.display_name,
    name: user.display_name || user.email.split('@')[0],
    role: user.role,
    avatar: initials,
    created_at: user.created_at,
  });
}

export async function updateProfile(req, res) {
  const { display_name } = req.body;
  await db.query('UPDATE users SET display_name = ?, updated_at = NOW() WHERE id = ?', [
    display_name,
    req.user.id,
  ]);

  const updated = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = updated[0];

  return successResponse(res, 'Profile updated successfully', {
    id: user.id,
    display_name: user.display_name,
    name: user.display_name,
    email: user.email,
    role: user.role,
  });
}
