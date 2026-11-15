import { errorResponse } from '../utils/response.js';

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles Roles permitted to access the endpoint ('student', 'admin')
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}
