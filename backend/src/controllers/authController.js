import { successResponse } from '../utils/response.js';

export async function syncAuth(req, res) {
  const user = req.user;
  const initials = user.display_name
    ? user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return successResponse(res, 'Authentication profile synchronized successfully', {
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
