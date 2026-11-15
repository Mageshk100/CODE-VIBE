/**
 * Standard API response builders matching Code Vibe Phase 2 specifications
 */

export function successResponse(res, message, data = null, statusCode = 200) {
  const payload = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
}

export function errorResponse(res, message, statusCode = 400, errors = null) {
  const payload = {
    success: false,
    message,
  };
  if (errors && process.env.NODE_ENV !== 'production') {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}
